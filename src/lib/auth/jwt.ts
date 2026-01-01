/**
 * JWT 인증 유틸리티
 * 기존 src/lib/admin/auth.ts 기반 확장
 */

import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPayloadInput,
  SessionUser,
} from "./types";

// 쿠키 이름
export const ACCESS_TOKEN_COOKIE = "bl_access_token";
export const REFRESH_TOKEN_COOKIE = "bl_refresh_token";

// 만료 시간
export const ACCESS_TOKEN_EXPIRY = "2h";    // 2시간
export const REFRESH_TOKEN_EXPIRY = "7d";   // 7일

// 시크릿 (AUTH_SECRET 통일)
const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET!);

/**
 * Access Token 생성
 */
export async function generateAccessToken(payload: TokenPayloadInput): Promise<string> {
  const tokenPayload: Omit<AccessTokenPayload, "iat" | "exp"> = {
    sub: payload.sub,
    type: "access",
    email: payload.email,
    role: payload.role,
    status: payload.status,
    provider: payload.provider,
    providerUserId: payload.providerUserId,
    name: payload.name,
    avatar: payload.avatar,
    hospitalAccess: payload.hospitalAccess,
  };

  return new SignJWT(tokenPayload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(getSecret());
}

/**
 * Refresh Token 생성
 */
export async function generateRefreshToken(
  sub: string,
  role: TokenPayloadInput["role"]
): Promise<string> {
  const tokenPayload: Omit<RefreshTokenPayload, "iat" | "exp"> = {
    sub,
    type: "refresh",
    role,
  };

  return new SignJWT(tokenPayload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(getSecret());
}

/**
 * Access Token + Refresh Token 쌍 생성
 */
export async function generateTokenPair(payload: TokenPayloadInput): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload.sub, payload.role),
  ]);

  return { accessToken, refreshToken };
}

/**
 * Access Token 검증
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "access") return null;
    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Refresh Token 검증
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "refresh") return null;
    return payload as unknown as RefreshTokenPayload;
  } catch {
    return null;
  }
}

/**
 * 쿠키에서 Access Token 읽기 (Server Component용)
 */
export async function readAccessToken(): Promise<AccessTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

/**
 * 쿠키에서 Refresh Token 읽기 (Server Component용)
 */
export async function readRefreshToken(): Promise<RefreshTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyRefreshToken(token);
}

/**
 * Access Token을 SessionUser로 변환
 */
export function tokenToSessionUser(payload: AccessTokenPayload): SessionUser {
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    status: payload.status,
    provider: payload.provider,
    providerUserId: payload.providerUserId,
    name: payload.name,
    avatar: payload.avatar,
    hospitalAccess: payload.hospitalAccess,
  };
}

/**
 * 현재 세션 사용자 조회 (Server Component용)
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const payload = await readAccessToken();
  if (!payload) return null;
  return tokenToSessionUser(payload);
}

/**
 * 쿠키 옵션 (환경별)
 */
function getCookieOptions(maxAge: number) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/**
 * 응답에 인증 쿠키 설정
 */
export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  // Access Token: 2시간
  res.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, getCookieOptions(2 * 60 * 60));

  // Refresh Token: 7일
  res.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, getCookieOptions(7 * 24 * 60 * 60));
}

/**
 * 응답에서 인증 쿠키 삭제
 */
export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...getCookieOptions(0), maxAge: 0 });
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...getCookieOptions(0), maxAge: 0 });
}

/**
 * Server Action/Component에서 쿠키 설정 (cookies() 사용)
 */
export async function setAuthCookiesServer(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, getCookieOptions(2 * 60 * 60));
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, getCookieOptions(7 * 24 * 60 * 60));
}

/**
 * Server Action/Component에서 쿠키 삭제 (cookies() 사용)
 */
export async function clearAuthCookiesServer(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, "", { ...getCookieOptions(0), maxAge: 0 });
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", { ...getCookieOptions(0), maxAge: 0 });
}

// ============================================
// 기존 Admin 호환용 (점진적 마이그레이션)
// ============================================

/** @deprecated admin/auth.ts 호환용 - 추후 제거 */
export const ADMIN_COOKIE_NAME = "bl_admin_session";

/** @deprecated admin/auth.ts 호환용 - issueSession 대체 */
export async function issueAdminSession(
  payload: Record<string, unknown>,
  exp = "2h"
): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getSecret());
}

/** @deprecated admin/auth.ts 호환용 - readSession 대체 */
export async function readAdminSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}
