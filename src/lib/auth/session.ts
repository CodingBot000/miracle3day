/**
 * 통합 세션 유틸리티
 * API Route, Server Component, Middleware에서 사용
 */

import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getSessionUser,
  tokenToSessionUser,
} from "./jwt";
import type { AccessTokenPayload, SessionUser } from "./types";

const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET!);

/**
 * API Route에서 세션 조회 (NextRequest 사용)
 */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;

  try {
    const { payload } = await jwtVerify(accessToken, getSecret());
    if (payload.type !== "access") return null;
    return tokenToSessionUser(payload as unknown as AccessTokenPayload);
  } catch {
    return null;
  }
}

/**
 * API Route에서 Refresh Token 조회
 */
export async function getRefreshTokenFromRequest(req: NextRequest): Promise<string | null> {
  return req.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

/**
 * Server Component/Action에서 세션 조회
 */
export async function getSession(): Promise<SessionUser | null> {
  return getSessionUser();
}

/**
 * 로그인 필수 - 미로그인 시 redirect
 * (기존 requireUserId 대체)
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * 로그인 필수 + active 상태 필수
 */
export async function requireActiveSession(): Promise<SessionUser> {
  const session = await requireSession();

  if (session.status !== "active") {
    redirect("/terms");
  }

  return session;
}

/**
 * 로그인된 사용자 ID 필수 조회
 * (기존 requireUserId 직접 대체)
 */
export async function requireUserId(): Promise<string> {
  const session = await requireActiveSession();
  return session.id;
}

/**
 * Middleware용 세션 검증 결과
 */
export interface SessionVerifyResult {
  valid: boolean;
  needsRefresh: boolean;
  payload?: AccessTokenPayload;
}

/**
 * Middleware에서 세션 검증
 */
export async function verifySessionForMiddleware(
  req: NextRequest
): Promise<SessionVerifyResult> {
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // 토큰 없음
  if (!accessToken && !refreshToken) {
    return { valid: false, needsRefresh: false };
  }

  // Access Token 검증
  if (accessToken) {
    try {
      const { payload } = await jwtVerify(accessToken, getSecret());
      if (payload.type === "access") {
        return {
          valid: true,
          needsRefresh: false,
          payload: payload as unknown as AccessTokenPayload,
        };
      }
    } catch {
      // Access Token 만료 - Refresh 필요
    }
  }

  // Access Token 없거나 만료 → Refresh Token 확인
  if (refreshToken) {
    try {
      const { payload } = await jwtVerify(refreshToken, getSecret());
      if (payload.type === "refresh") {
        return { valid: false, needsRefresh: true };
      }
    } catch {
      // Refresh Token도 만료
    }
  }

  return { valid: false, needsRefresh: false };
}

