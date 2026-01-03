/**
 * 스킨케어 온보딩 체크 API
 *
 * GET /api/skincare/onboarding/check
 * - JWT 토큰에서 사용자 ID 추출
 * - skincare_onboarding 테이블에서 온보딩 완료 여부 확인
 */

import { NextRequest, NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // 1. JWT 토큰에서 user_id 추출
    const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, hasOnboarding: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(token);

    if (!payload || payload.status !== 'active') {
      return NextResponse.json(
        { success: false, hasOnboarding: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.sub; // members.id_uuid

    // 2. skincare_onboarding 테이블에서 조회
    const onboarding = await one(
      `SELECT id_uuid, onboarding_completed
       FROM skincare_onboarding
       WHERE id_uuid = $1`,
      [userId]
    );

    // 3. 결과 반환
    if (!onboarding || !onboarding.onboarding_completed) {
      return NextResponse.json({
        success: true,
        hasOnboarding: false,
        userId,
      });
    }

    return NextResponse.json({
      success: true,
      hasOnboarding: true,
      userId,
    });
  } catch (error) {
    console.error('온보딩 체크 오류:', error);
    const message = error instanceof Error ? error.message : 'Check failed';
    return NextResponse.json(
      { success: false, hasOnboarding: false, error: message },
      { status: 500 }
    );
  }
}
