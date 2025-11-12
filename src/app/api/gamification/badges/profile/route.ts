/**
 * Badge Profile API Route
 * GET /api/gamification/badges/profile - Get user's complete badge profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile } from '@/services/badges';

export async function GET(req: NextRequest) {
  try {
    // userUuid를 쿼리 파라미터에서 가져오기
    const { searchParams } = new URL(req.url);
    const userUuid = searchParams.get('userUuid');

    if (!userUuid) {
      return NextResponse.json(
        { success: false, error: 'User UUID is required' },
        { status: 400 }
      );
    }

    // 프로필 조회 (자동 복구 포함)
    const profile = await getUserProfile(userUuid);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Badge profile API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
