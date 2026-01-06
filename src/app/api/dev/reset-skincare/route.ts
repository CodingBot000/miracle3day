/**
 * [DEV] Skincare 데이터 초기화 API
 *
 * 로그인된 사용자의 skincare 관련 데이터만 삭제 (계정 유지)
 * - skincare_onboarding
 * - skincare_routine_steps
 * - skincare_routines
 * - product_my_beauty_box
 *
 * ⚠️ 개발/테스트 전용 - 프로덕션에서는 비활성화 권장
 */

import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/jwt';

// 개발 환경에서만 허용
const isDev = process.env.NODE_ENV === 'development';

export async function DELETE() {
  // 프로덕션 차단
  if (!isDev) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    // 세션 확인
    const session = await getSessionUser();
    if (!session || session.status !== 'active') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.id;
    let currentStep = '';

    try {
      // 1. skincare_routine_steps 삭제 (routine_uuid 기반으로 삭제)
      currentStep = 'skincare_routine_steps';
      await q(
        `DELETE FROM skincare_routine_steps
         WHERE routine_uuid IN (
           SELECT id_uuid FROM skincare_routines WHERE id_uuid_member = $1
         )`,
        [userId]
      );

      // 2. skincare_routines 삭제
      currentStep = 'skincare_routines';
      await q(
        `DELETE FROM skincare_routines WHERE id_uuid_member = $1`,
        [userId]
      );

      // 3. skincare_onboarding 삭제
      currentStep = 'skincare_onboarding';
      await q(
        `DELETE FROM skincare_onboarding WHERE id_uuid_member = $1`,
        [userId]
      );

      // 4. product_my_beauty_box 삭제
      currentStep = 'product_my_beauty_box';
      await q(
        `DELETE FROM product_my_beauty_box WHERE id_uuid_member = $1`,
        [userId]
      );

      console.log(`[DEV] Reset skincare data for user ${userId}`);

      return NextResponse.json({
        success: true,
        message: 'Skincare data reset complete',
      });
    } catch (stepError) {
      console.error(`[DEV] Reset skincare error at step [${currentStep}]:`, stepError);
      return NextResponse.json(
        {
          error: `Failed at step: ${currentStep}`,
          detail: stepError instanceof Error ? stepError.message : String(stepError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[DEV] Reset skincare error:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset skincare data',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
