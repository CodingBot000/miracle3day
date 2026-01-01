/**
 * 인증 헬퍼 (JWT 기반)
 */

import { getSessionUser } from "@/lib/auth/jwt";

/**
 * 현재 인증된 세션 정보 조회
 * @param _req - 사용되지 않음 (API 호환성 유지)
 */
export async function getAuthSession(_req?: Request) {
  try {
    const session = await getSessionUser();

    if (!session || session.status !== 'active') {
      return null;
    }

    return {
      userId: session.id,
      email: session.email,
      provider: session.provider
    };
  } catch (error) {
    console.error('Auth session error:', error);
    return null;
  }
}
