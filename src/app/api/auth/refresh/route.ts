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

    // DB에서 최신 사용자 정보 조회
    const [user] = await q(
      `SELECT id_uuid, email, role, name, avatar, is_active
       FROM ${TABLE_MEMBERS}
       WHERE id_uuid = $1`,
      [payload.sub]
    );

    if (!user || user.is_active === false) {
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

    // DB에서 최신 사용자 정보 조회
    const [user] = await q(
      `SELECT id_uuid, email, role, name, avatar, is_active
       FROM ${TABLE_MEMBERS}
       WHERE id_uuid = $1`,
      [payload.sub]
    );

    if (!user || user.is_active === false) {
      const res = NextResponse.json(
        { error: "User not found or inactive" },
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
