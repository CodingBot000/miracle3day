import { NextResponse, NextRequest } from "next/server";
import { one, q } from "@/lib/db";
import {
  verifyAccessToken,
  ACCESS_TOKEN_COOKIE,
  tokenToSessionUser,
  generateTokenPair,
  setAuthCookies,
} from "@/lib/auth/jwt";
import type { TokenPayloadInput, SessionUser } from "@/lib/auth/types";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ auth: null });
    }

    const payload = await verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json({ auth: null });
    }

    // pending 상태면 DB 조회 없이 반환
    if (payload.status === "pending") {
      return NextResponse.json({ auth: tokenToSessionUser(payload) });
    }

    // DB에서 사용자 검증 (DB를 source of truth로 사용)
    const member = await one(
      'SELECT id_uuid, role FROM members WHERE id_uuid = $1',
      [payload.sub]
    );

    // DB에 해당 사용자가 없으면 세션 무효화
    if (!member) {
      console.warn(`[Session] User ${payload.sub} not found in DB.`);
      return NextResponse.json({ auth: null });
    }

    // role이 hospital_admin이면 hospitalAccess 재조회 및 토큰 갱신
    let auth: SessionUser = tokenToSessionUser(payload);
    let needsTokenRefresh = false;

    if (member.role === 'hospital_admin') {
      try {
        const adminAccess = await q(
          `SELECT a.id_uuid_hospital, h.name_en as hospital_name
           FROM admin a
           LEFT JOIN hospital h ON h.id_uuid = a.id_uuid_hospital
           WHERE $1 = ANY(a.authorized_ids)`,
          [payload.email]
        );

        const hospitalAccess = adminAccess.map((row: any) => ({
          hospital_id: row.id_uuid_hospital,
          hospital_name: row.hospital_name,
        }));

        // hospitalAccess가 변경되었는지 확인
        const currentAccess = JSON.stringify(auth.hospitalAccess || []);
        const newAccess = JSON.stringify(hospitalAccess);

        if (currentAccess !== newAccess || auth.role !== 'hospital_admin') {
          auth.role = 'hospital_admin';
          auth.hospitalAccess = hospitalAccess;
          needsTokenRefresh = true;
        }
      } catch (adminError) {
        console.error('⚠️ Admin access refresh failed:', adminError);
        auth.role = 'hospital_admin';
        auth.hospitalAccess = [];
      }
    } else if (auth.role !== member.role) {
      auth.role = member.role || 'user';
      auth.hospitalAccess = [];
      needsTokenRefresh = true;
    }

    // 토큰 갱신이 필요한 경우
    if (needsTokenRefresh) {
      const tokenInput: TokenPayloadInput = {
        sub: auth.id,
        email: auth.email,
        role: auth.role,
        status: auth.status,
        provider: auth.provider,
        providerUserId: auth.providerUserId,
        name: auth.name,
        avatar: auth.avatar,
        hospitalAccess: auth.hospitalAccess,
      };

      const tokens = await generateTokenPair(tokenInput);
      const res = NextResponse.json({ auth });
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      return res;
    }

    return NextResponse.json({ auth });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ auth: null });
  }
}
