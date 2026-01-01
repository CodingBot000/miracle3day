/**
 * API Route에서 세션 조회 (JWT 기반)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, ACCESS_TOKEN_COOKIE, tokenToSessionUser } from "./jwt";
import type { SessionUser } from "./types";

/**
 * API Route에서 JWT 세션 조회
 * @deprecated 새 코드는 getSessionFromRequest 사용 권장
 */
export async function getSessionFromRoute(
  req: NextRequest,
  _res: NextResponse
): Promise<{ auth: SessionUser | null }> {
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return { auth: null };
  }

  const payload = await verifyAccessToken(token);

  if (!payload) {
    return { auth: null };
  }

  return { auth: tokenToSessionUser(payload) };
}

// 새 API - 직접 사용 권장
export { getSessionFromRequest } from "./session";
