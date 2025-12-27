/**
 * 스킨케어 온보딩 조회 API
 *
 * GET /api/skincare/onboarding/[userId] - 사용자별 온보딩 데이터 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { one } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 사용자의 온보딩 데이터 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // 온보딩 데이터 조회
    const data = await one(
      `SELECT * FROM skincare_onboarding WHERE id_uuid = $1`,
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
