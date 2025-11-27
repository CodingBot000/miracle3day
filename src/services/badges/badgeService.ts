import { log } from '@/utils/logger';
/**
 * Badge Service - Core badge management logic
 * Handles badge awarding, user state updates, and badge queries
 */

import { query } from '@/lib/db';
import {
  ActivityLogInput,
  ActivityType,
  logActivity,
  getActivityCount,
  hasCheckedInToday,
  getCheckinStreak,
  ACTIVITY_TYPES,
} from './activityLogger';
import {
  getPointsForActivity,
  getExpForActivity,
  calculateLevel,
  getExpProgress,
  calculatePointsWithBonus,
  getTier,
} from './pointsCalculator';
import type { Notification, BadgeNotification } from '@/types/badge';

export interface BadgeRule {
  badgeId: string;
  name: string;
  description: string;
  activityType: string;
  threshold: number;
  tier: number;
}

export interface UserBadgeState {
  userId: string;
  totalPoints: number;
  totalExp: number;
  level: number;
  currentStreak: number;
  lastActivityDate: Date | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  tier: number;
  activityType: string;
  threshold: number;
  createdAt: Date;
}

/**
 * 배지 시스템 초기화
 * - badges_user_profile에 유저 레벨/경험치 생성
 * - 모든 배지에 대한 초기 상태 생성 (badges_user_state)
 */
async function ensureUserState(userId: string): Promise<void> {
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
  } catch (error) {
    console.error('[BadgeService] Failed to ensure user state:', error);
    throw error;
  }
}

/**
 * Gets user's current badge state (level and exp)
 */
export async function getUserState(userId: string): Promise<{ level: number; exp: number }> {
  try {
    const result = await query(
      `SELECT level, exp FROM badges_user_profile WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return { level: 1, exp: 0 };
    }

    return {
      level: result.rows[0].level,
      exp: result.rows[0].exp,
    };
  } catch (error) {
    console.error('[BadgeService] Failed to get user state:', error);
    return { level: 1, exp: 0 };
  }
}

/**
 * Updates user's exp and level
 */
async function updateUserState(
  userId: string,
  expDelta: number
): Promise<{ leveledUp: boolean; newLevel: number; newExp: number }> {
  try {
    const currentState = await getUserState(userId);

    const newExp = currentState.exp + expDelta;
    const newLevel = calculateLevel(newExp);
    const leveledUp = newLevel > currentState.level;

    await query(
      `UPDATE badges_user_profile
       SET exp = $1,
           level = $2,
           updated_at = NOW()
       WHERE user_id = $3`,
      [newExp, newLevel, userId]
    );

    return { leveledUp, newLevel, newExp };
  } catch (error) {
    console.error('[BadgeService] Failed to update user state:', error);
    throw error;
  }
}

/**
 * Gets all badge definitions
 */
export async function getAllBadges(): Promise<Badge[]> {
  try {
    const result = await query(
      `SELECT id, name, description, icon_url, tier, activity_type, threshold, created_at
       FROM badges_master
       ORDER BY tier ASC, threshold ASC`
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      iconUrl: row.icon_url,
      tier: parseInt(row.tier, 10),
      activityType: row.activity_type,
      threshold: parseInt(row.threshold, 10),
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('[BadgeService] Failed to get all badges:', error);
    return [];
  }
}

/**
 * Gets user's earned badges
 */
export async function getUserBadges(userId: string): Promise<any[]> {
  try {
    const result = await query(
      `SELECT
         ub.id,
         ub.badge_id,
         ub.earned_at,
         bd.name,
         bd.description,
         bd.icon_url,
         bd.tier,
         bd.activity_type,
         bd.threshold
       FROM badges_user_badges ub
       JOIN badges_master bd ON ub.badge_id = bd.id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('[BadgeService] Failed to get user badges:', error);
    return [];
  }
}

/**
 * Awards a badge to a user
 */
async function awardBadge(userId: string, badgeId: string): Promise<void> {
  try {
    // Check if badge already earned
    const existing = await query(
      `SELECT id FROM badges_user_badges
       WHERE user_id = $1 AND badge_id = $2`,
      [userId, badgeId]
    );

    if (existing.rows.length > 0) {
      return; // Already earned
    }

    await query(
      `INSERT INTO badges_user_badges (user_id, badge_id)
       VALUES ($1, $2)`,
      [userId, badgeId]
    );

    log.debug(`[BadgeService] Awarded badge ${badgeId} to user ${userId}`);
  } catch (error) {
    console.error('[BadgeService] Failed to award badge:', error);
    throw error;
  }
}

/**
 * Gets badges related to specific activity type
 */
async function getRelatedBadges(activityType: string): Promise<any[]> {
  try {
    // Activity type to badge code mapping
    const badgeMapping: Record<string, string[]> = {
      post_create: ['content_creator'],
      comment_create: ['comment_master', 'helpful_neighbor'],
      like_given: ['reaction_giver'],
      like_received: [],
      poll_vote: ['poll_enthusiast'],
      daily_checkin: ['daily_devotee'],
    };

    const badgeCodes = badgeMapping[activityType] || [];

    if (badgeCodes.length === 0) {
      return [];
    }

    const result = await query(
      `SELECT code, name, level_thresholds, max_level, meta
       FROM badges_master
       WHERE code = ANY($1)`,
      [badgeCodes]
    );

    return result.rows;
  } catch (error) {
    console.error('[BadgeService] Failed to get related badges:', error);
    return [];
  }
}

/**
 * Checks and awards badges based on activity
 * @returns Badge notifications for newly awarded badges
 */
async function checkAndAwardBadges(
  userId: string,
  activityType: string
): Promise<BadgeNotification[]> {
  const notifications: BadgeNotification[] = [];

  try {
    // Get badges related to this activity type
    const relatedBadges = await getRelatedBadges(activityType);

    for (const badge of relatedBadges) {
      // Get current badge state
      const stateResult = await query(
        `SELECT current_level, progress
         FROM badges_user_state
         WHERE user_id = $1 AND badge_code = $2`,
        [userId, badge.code]
      );

      if (stateResult.rows.length === 0) continue;

      const state = stateResult.rows[0];
      const currentLevel = state.current_level;
      const currentProgress = state.progress + 1; // Increment progress

      // Update progress
      await query(
        `UPDATE badges_user_state
         SET progress = $1
         WHERE user_id = $2 AND badge_code = $3`,
        [currentProgress, userId, badge.code]
      );

      // Check for level up
      const thresholds = badge.level_thresholds;
      const nextLevel = currentLevel + 1;
      const threshold = thresholds[nextLevel - 1];

      if (threshold && currentProgress >= threshold) {
        // Level up the badge
        await query(
          `UPDATE badges_user_state
           SET current_level = $1,
               last_level_up_at = NOW(),
               first_earned_at = COALESCE(first_earned_at, NOW())
           WHERE user_id = $2 AND badge_code = $3`,
          [nextLevel, userId, badge.code]
        );

        // Create notification
        const points = badge.meta?.points?.[nextLevel] || 0;
        notifications.push({
          type: 'badge',
          badge: {
            code: badge.code,
            name: badge.name,
            level: nextLevel,
          },
          points,
        });

        log.debug(`🏆 Badge awarded: ${badge.code} Lv.${nextLevel} to user ${userId}`);
      }
    }

    return notifications;
  } catch (error) {
    console.error('[BadgeService] checkAndAwardBadges error:', error);
    return [];
  }
}

/**
 * Main function to process an activity and generate notifications
 * @returns Array of notifications (badge awards, level ups)
 */
export async function processActivity(params: {
  userId: string;
  activityType: string;
  metadata?: Record<string, any>;
  referenceId?: string;
}): Promise<Notification[]> {
  const { userId, activityType, metadata, referenceId } = params;
  const notifications: Notification[] = [];

  try {
    // 1. Ensure user state exists
    await ensureUserState(userId);

    // 2. Log the activity
    await logActivity({
      userId,
      activityType: activityType as ActivityType,
      metadata,
      referenceId,
    });

    // 3. Get old state before update
    const oldState = await getUserState(userId);

    // 4. Calculate and add exp
    const baseExp = getExpForActivity(activityType as ActivityType);
    const { leveledUp, newLevel, newExp } = await updateUserState(userId, baseExp);

    // 5. Check for level up
    if (leveledUp) {
      notifications.push({
        type: 'levelup',
        level: newLevel,
        exp: newExp,
      });
    }

    // 6. Check and award badges
    const badgeNotifications = await checkAndAwardBadges(userId, activityType);
    notifications.push(...badgeNotifications);

    return notifications;
  } catch (error) {
    console.error('[BadgeService] processActivity error:', error);
    return []; // Return empty array on error (fail-safe)
  }
}

/**
 * Process daily check-in
 */
export async function processCheckin(userId: string): Promise<{
  success: boolean;
  alreadyCheckedIn: boolean;
  streak: number;
  notifications: Notification[];
}> {
  try {
    // Check if already checked in today
    const alreadyCheckedIn = await hasCheckedInToday(userId);
    if (alreadyCheckedIn) {
      return {
        success: false,
        alreadyCheckedIn: true,
        streak: 0,
        notifications: [],
      };
    }

    // Process checkin activity
    const notifications = await processActivity({
      userId,
      activityType: ACTIVITY_TYPES.DAILY_CHECKIN,
      metadata: { timestamp: new Date().toISOString() },
    });

    // Get streak
    const newStreak = await getCheckinStreak(userId);

    return {
      success: true,
      alreadyCheckedIn: false,
      streak: newStreak,
      notifications,
    };
  } catch (error) {
    console.error('[BadgeService] Failed to process checkin:', error);
    return {
      success: false,
      alreadyCheckedIn: false,
      streak: 0,
      notifications: [],
    };
  }
}

/**
 * 배지 프로필 데이터 구성
 */
async function buildUserProfile(profile: any, userId: string) {
  const level = profile.level || 1;
  const exp = profile.exp || 0;

  // 레벨 계산 공식: level = floor(sqrt(exp / 100)) + 1
  // 다음 레벨 필요 경험치: (level^2) * 100
  const nextLevelExp = Math.pow(level, 2) * 100;

  // 2. 획득한 배지 조회 (current_level > 0)
  const earnedBadgesResult = await query(
    `SELECT
      bs.badge_code,
      bs.current_level,
      bs.first_earned_at,
      bm.name,
      bm.icon_url,
      bm.max_level
     FROM badges_user_state bs
     JOIN badges_master bm ON bs.badge_code = bm.code
     WHERE bs.user_id = $1
       AND bs.current_level > 0
     ORDER BY bs.first_earned_at DESC
     LIMIT 8`,
    [userId]
  );

  // 3. 진행 중인 배지 조회 (current_level = 0 이거나 max_level 미만)
  const inProgressResult = await query(
    `SELECT
      bs.badge_code,
      bs.current_level,
      bs.progress,
      bm.name,
      bm.icon_url,
      bm.level_thresholds,
      bm.max_level
     FROM badges_user_state bs
     JOIN badges_master bm ON bs.badge_code = bm.code
     WHERE bs.user_id = $1
       AND (
         bs.current_level = 0
         OR bs.current_level < bm.max_level
       )
     ORDER BY
       CASE
         WHEN bs.current_level = 0
           THEN bm.level_thresholds[1] - bs.progress
         ELSE bm.level_thresholds[bs.current_level + 1] - bs.progress
       END ASC
     LIMIT 2`,
    [userId]
  );

  // 4. 응답 데이터 구성
  return {
    level,
    exp,
    points: exp, // 포인트 = 경험치
    nextLevelExp,
    earnedBadges: earnedBadgesResult.rows.map(row => ({
      code: row.badge_code,
      name: row.name,
      level: row.current_level,
      iconUrl: row.icon_url,
      earnedAt: row.first_earned_at,
      maxLevel: row.max_level,
    })),
    inProgressBadges: inProgressResult.rows.map(row => {
      const thresholds = row.level_thresholds || [];
      const nextLevel = row.current_level + 1;
      const threshold = thresholds[nextLevel - 1] || 0;

      return {
        code: row.badge_code,
        name: row.name,
        currentLevel: row.current_level,
        progress: row.progress,
        threshold,
        iconUrl: row.icon_url,
      };
    }),
  };
}

/**
 * 사용자 배지 프로필 조회 (자동 복구 포함)
 */
export async function getUserProfile(userId: string): Promise<any> {
  try {
    // 1. 유저 프로필 조회 (레벨/경험치)
    const profileResult = await query(
      `SELECT user_id, exp, level, updated_at
       FROM badges_user_profile
       WHERE user_id = $1`,
      [userId]
    );

    // 프로필 없으면 자동 생성 (2차 방어선)
    if (profileResult.rows.length === 0) {
      log.debug(`🔄 Auto-initializing badge system for user: ${userId}`);
      await ensureUserState(userId);

      // 재조회
      const retryResult = await query(
        `SELECT user_id, exp, level, updated_at
         FROM badges_user_profile
         WHERE user_id = $1`,
        [userId]
      );

      if (retryResult.rows.length === 0) {
        throw new Error('Failed to initialize badge profile');
      }

      return buildUserProfile(retryResult.rows[0], userId);
    }

    return buildUserProfile(profileResult.rows[0], userId);
  } catch (error) {
    console.error('[BadgeService] Failed to get user profile:', error);
    throw error;
  }
}
