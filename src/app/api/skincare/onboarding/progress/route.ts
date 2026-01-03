/**
 * 스킨케어 온보딩 진행 상태 업데이트 API
 *
 * PATCH /api/skincare/onboarding/progress - 중간 저장 (이어하기 기능)
 * - JWT 토큰에서 사용자 ID 추출
 */

import { NextRequest, NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

/**
 * 온보딩 진행 상태 업데이트
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. JWT 토큰에서 user_id 추출
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

    const id_uuid = payload.sub; // JWT에서 추출

    // 2. 요청 본문에서 데이터 추출
    const body = await request.json();
    const { onboarding_step, ...partialData } = body;

    if (typeof onboarding_step !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Onboarding step is required' },
        { status: 400 }
      );
    }

    // 업데이트할 필드 동적 생성
    const updateFields: string[] = ['onboarding_step = $2'];
    const values: any[] = [id_uuid, onboarding_step];
    let paramIndex = 3;

    // 부분 데이터가 있으면 추가
    Object.entries(partialData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    // UPSERT: 데이터가 없으면 새로 생성, 있으면 업데이트
    const result = await one(
      `INSERT INTO skincare_onboarding (
        id_uuid,
        onboarding_step,
        created_at,
        updated_at
      ) VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (id_uuid)
      DO UPDATE SET
        ${updateFields.join(', ')},
        updated_at = NOW()
      RETURNING *`,
      values
    );

    return NextResponse.json({
      success: true,
      message: '진행 상태가 저장되었습니다',
      data: result,
    });
  } catch (error) {
    console.error('온보딩 진행 상태 업데이트 오류:', error);
    const message = error instanceof Error ? error.message : '업데이트 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
