import { NextRequest, NextResponse } from "next/server";
import { q } from "@/lib/db";
import { TABLE_MEMBERS } from "@/constants/tables";
import {
  verifyRefreshToken,
  generateTokenPair,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/jwt";
import type { TokenPayloadInput, HospitalAccess } from "@/lib/auth/types";

// Retry 설정
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 300;

// 지연 헬퍼
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// DB 조회 결과 타입
type UserQueryResult =
  | { success: true; user: any }
  | { success: false; notFound: true }
  | { success: false; notFound: false; error: Error };

// DB 조회 with retry
async function getUserWithRetry(userId: string): Promise<UserQueryResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const [user] = await q(
        `SELECT id_uuid, email, role, name, avatar, is_active
         FROM ${TABLE_MEMBERS}
         WHERE id_uuid = $1`,
        [userId]
      );

      if (!user) {
        // 사용자가 DB에 없음 (탈퇴 등) - 명확한 "없음"
        return { success: false, notFound: true };
      }

      return { success: true, user };
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Refresh] DB query attempt ${attempt + 1} failed:`, error);

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1)); // 점진적 지연
      }
    }
  }

  // 모든 재시도 실패 - DB 연결 오류
  return { success: false, notFound: false, error: lastError! };
}

/**
 * GET /api/auth/refresh
 * Middleware에서 리다이렉트 시 사용 (redirect 파라미터로 원래 경로 전달)
 */
export async function GET(req: NextRequest) {
  const redirectUrl = req.nextUrl.searchParams.get("redirect") || "/";
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      clearAuthCookies(res);
      return res;
    }

    // DB에서 최신 사용자 정보 조회 (with retry)
    const userResult = await getUserWithRetry(payload.sub);

    if (!userResult.success) {
      if (userResult.notFound) {
        // 사용자가 DB에 없음 → 쿠키 삭제 후 로그인 페이지
        const res = NextResponse.redirect(new URL("/login", req.url));
        clearAuthCookies(res);
        return res;
      } else {
        // DB 연결 오류 → 쿠키 유지, 일시적 오류 처리
        console.error("[Refresh] DB connection error after retries:", userResult.error);
        // 원래 페이지로 리다이렉트 (쿠키 유지, 다음 요청에서 재시도)
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
    }

    const user = userResult.user;

    if (user.is_active === false) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      clearAuthCookies(res);
      return res;
    }

    // Hospital Admin 권한 조회
    let hospitalAccess: HospitalAccess[] = [];
    if (user.role === "hospital_admin") {
      const adminAccess = await q(
        `SELECT a.id_uuid_hospital as hospital_id, h.name_en as hospital_name
         FROM admin a
         LEFT JOIN hospital h ON h.id_uuid = a.id_uuid_hospital
         WHERE $1 = ANY(a.authorized_ids)`,
        [user.email]
      );
      hospitalAccess = adminAccess.map((row) => ({
        hospital_id: row.hospital_id,
        hospital_name: row.hospital_name,
      }));
    }

    // 새 토큰 쌍 생성
    const tokenInput: TokenPayloadInput = {
      sub: user.id_uuid,
      email: user.email,
      role: user.role || "user",
      status: "active",
      provider: "google", // 기존 정보 유지 (DB에 저장하면 조회 가능)
      name: user.name,
      avatar: user.avatar,
      hospitalAccess: hospitalAccess.length > 0 ? hospitalAccess : undefined,
    };

    const tokens = await generateTokenPair(tokenInput);

    const res = NextResponse.redirect(new URL(redirectUrl, req.url));
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return res;
  } catch (error) {
    console.error("Refresh token error:", error);
    const res = NextResponse.redirect(new URL("/login", req.url));
    clearAuthCookies(res);
    return res;
  }
}

/**
 * POST /api/auth/refresh
 * 클라이언트에서 직접 호출 시 사용 (JSON 응답)
 */
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      const res = NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
      clearAuthCookies(res);
      return res;
    }

    // DB에서 최신 사용자 정보 조회 (with retry)
    const userResult = await getUserWithRetry(payload.sub);

    if (!userResult.success) {
      if (userResult.notFound) {
        // 사용자가 DB에 없음 → 쿠키 삭제
        const res = NextResponse.json(
          { error: "User not found" },
          { status: 401 }
        );
        clearAuthCookies(res);
        return res;
      } else {
        // DB 연결 오류 → 쿠키 유지, 503 반환 (일시적 오류)
        console.error("[Refresh] DB connection error after retries:", userResult.error);
        return NextResponse.json(
          { error: "Temporary error, please retry" },
          { status: 503 }
        );
      }
    }

    const user = userResult.user;

    if (user.is_active === false) {
      const res = NextResponse.json(
        { error: "User inactive" },
        { status: 401 }
      );
      clearAuthCookies(res);
      return res;
    }

    // Hospital Admin 권한 조회
    let hospitalAccess: HospitalAccess[] = [];
    if (user.role === "hospital_admin") {
      const adminAccess = await q(
        `SELECT a.id_uuid_hospital as hospital_id, h.name_en as hospital_name
         FROM admin a
         LEFT JOIN hospital h ON h.id_uuid = a.id_uuid_hospital
         WHERE $1 = ANY(a.authorized_ids)`,
        [user.email]
      );
      hospitalAccess = adminAccess.map((row) => ({
        hospital_id: row.hospital_id,
        hospital_name: row.hospital_name,
      }));
    }

    // 새 토큰 쌍 생성
    const tokenInput: TokenPayloadInput = {
      sub: user.id_uuid,
      email: user.email,
      role: user.role || "user",
      status: "active",
      provider: "google",
      name: user.name,
      avatar: user.avatar,
      hospitalAccess: hospitalAccess.length > 0 ? hospitalAccess : undefined,
    };

    const tokens = await generateTokenPair(tokenInput);

    const res = NextResponse.json({ success: true });
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return res;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Refresh failed" },
      { status: 500 }
    );
  }
}
