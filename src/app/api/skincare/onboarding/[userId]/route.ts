/**
 * 스킨케어 온보딩 조회 API
 *
 * GET /api/skincare/onboarding/[userId] - 사용자별 온보딩 데이터 조회
 * - JWT 인증 필수: 자신의 데이터만 조회 가능
 */

import { NextRequest, NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

/**
 * 사용자의 온보딩 데이터 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // 1. JWT 토큰 검증
    const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(token);

    if (!payload || payload.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { userId } = params;

    // 2. 자신의 데이터만 조회 가능 (보안)
    if (userId !== payload.sub) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // 3. 온보딩 데이터 조회
    const data = await one(
      `SELECT * FROM skincare_onboarding WHERE id_uuid_member = $1`,
      [userId]
    );

    if (!data) {
      return NextResponse.json(
        { success: false, message: 'Onboarding data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding data retrieved successfully',
      data,
    });
  } catch (error) {
    console.error('온보딩 조회 오류:', error);
    const message = error instanceof Error ? error.message : '조회 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
