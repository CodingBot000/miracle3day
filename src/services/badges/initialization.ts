import { log } from '@/utils/logger';
/**
 * Badge System Initialization
 * Non-blocking badge initialization for user registration
 */

import { query } from '@/lib/db';

/**
 * 배지 시스템 초기화 (Non-Blocking)
 * 실패해도 에러를 throw하지 않고 로그만 남김
 * - badges_user_profile에 유저 레벨/경험치 생성
 * - 모든 배지에 대한 초기 상태 생성 (badges_user_state)
 */
export async function initializeBadgeSystem(userId: string): Promise<boolean> {
  try {
    // 1. 유저 프로필 생성 (레벨/경험치)
    await query(
      `INSERT INTO badges_user_profile (user_id, exp, level)
       VALUES ($1, 0, 1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    // 2. 모든 배지에 대한 초기 상태 생성
    await query(
      `INSERT INTO badges_user_state (user_id, badge_code, current_level, progress)
       SELECT $1, code, 0, 0
       FROM badges_master
       ON CONFLICT (user_id, badge_code) DO NOTHING`,
      [userId]
    );

    log.debug(`✅ Badge system initialized for user: ${userId}`);
    return true;
  } catch (error) {
    console.error(`⚠️ Badge initialization failed for user ${userId}:`, error);
    // TODO: 에러 모니터링 서비스에 전송 (Sentry, CloudWatch 등)
    return false;
  }
}
