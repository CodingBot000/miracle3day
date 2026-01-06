/**
 * [DEV] 계정 완전 삭제 API
 *
 * 로그인된 사용자의 모든 데이터 삭제 (회원탈퇴)
 * - skincare 관련 데이터 먼저 삭제
 * - 이후 members 테이블에서 계정 삭제
 * - 세션 쿠키 제거
 *
 * ⚠️ 개발/테스트 전용 - 프로덕션에서는 비활성화 권장
 */

import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getSessionUser, clearAuthCookiesServer } from '@/lib/auth/jwt';
import { TABLE_MEMBERS } from '@/constants/tables';

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
    const deleted: Record<string, number> = {};

    // === 1. Skincare 관련 데이터 삭제 ===

    // 1-1. skincare_routine_steps 삭제
    const routineStepsResult = await q(
      `DELETE FROM skincare_routine_steps
       WHERE routine_uuid IN (
         SELECT id_uuid FROM skincare_routines WHERE id_uuid_member = $1
       )`,
      [userId]
    );
    deleted.skincare_routine_steps = routineStepsResult.rowCount || 0;

    // 1-2. skincare_routines 삭제
    const routinesResult = await q(
      `DELETE FROM skincare_routines WHERE id_uuid_member = $1`,
      [userId]
    );
    deleted.skincare_routines = routinesResult.rowCount || 0;

    // 1-3. skincare_onboarding 삭제
    const onboardingResult = await q(
      `DELETE FROM skincare_onboarding WHERE id_uuid_member = $1`,
      [userId]
    );
    deleted.skincare_onboarding = onboardingResult.rowCount || 0;

    // 1-4. product_my_beauty_box 삭제
    const beautyBoxResult = await q(
      `DELETE FROM product_my_beauty_box WHERE id_uuid_member = $1`,
      [userId]
    );
    deleted.product_my_beauty_box = beautyBoxResult.rowCount || 0;

    // === 2. 회원 탈퇴 (withdrawAction 로직) ===

    // 2-1. members 테이블에서 삭제
    const membersResult = await q(
      `DELETE FROM ${TABLE_MEMBERS} WHERE id_uuid = $1`,
      [userId]
    );
    deleted.members = membersResult.rowCount || 0;

    // 2-2. 세션 쿠키 제거
    await clearAuthCookiesServer();

    // 총 삭제 건수
    deleted.total = Object.values(deleted).reduce((a, b) => a + b, 0);

    console.log(`[DEV] Delete account for user ${userId}:`, deleted);

    return NextResponse.json({
      success: true,
      deleted,
      message: `Account deleted. Total ${deleted.total} records removed.`,
    });
  } catch (error) {
    console.error('[DEV] Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
