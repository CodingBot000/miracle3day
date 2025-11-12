/**
 * Activity Logger for Badge System
 * Logs user activities to the database for badge processing
 */

import { query } from '@/lib/db';

export const ACTIVITY_TYPES = {
  POST_CREATED: 'post_created',
  COMMENT_CREATED: 'comment_created',
  LIKE_GIVEN: 'like_given',
  LIKE_RECEIVED: 'like_received',
  POLL_VOTED: 'poll_voted',
  DAILY_CHECKIN: 'daily_checkin',
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

export interface ActivityLogInput {
  userId: string;
  activityType: ActivityType;
  metadata?: Record<string, any>;
  referenceId?: string;
}

/**
 * Logs an activity to the database
 */
export async function logActivity(input: ActivityLogInput): Promise<void> {
  const { userId, activityType, metadata = {}, referenceId } = input;

  try {
    await query(
      `INSERT INTO badges_activity_logs (user_id, activity_type, metadata, reference_id)
       VALUES ($1, $2, $3, $4)`,
      [userId, activityType, JSON.stringify(metadata), referenceId]
    );
  } catch (error) {
    console.error('[ActivityLogger] Failed to log activity:', error);
    throw error;
  }
}

/**
 * Gets activity count for a user by type
 */
export async function getActivityCount(
  userId: string,
  activityType: ActivityType,
  since?: Date
): Promise<number> {
  try {
    let sql = `
      SELECT COUNT(*) as count
      FROM badges_activity_logs
      WHERE user_id = $1 AND activity_type = $2
    `;
    const params: any[] = [userId, activityType];

    if (since) {
      sql += ` AND created_at >= $3`;
      params.push(since);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0]?.count || '0', 10);
  } catch (error) {
    console.error('[ActivityLogger] Failed to get activity count:', error);
    return 0;
  }
}

/**
 * Gets recent activities for a user
 */
export async function getRecentActivities(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const result = await query(
      `SELECT * FROM badges_activity_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('[ActivityLogger] Failed to get recent activities:', error);
    return [];
  }
}

/**
 * Checks if user has checked in today
 */
export async function hasCheckedInToday(userId: string): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await query(
      `SELECT COUNT(*) as count
       FROM badges_activity_logs
       WHERE user_id = $1
         AND activity_type = $2
         AND created_at >= $3`,
      [userId, ACTIVITY_TYPES.DAILY_CHECKIN, today]
    );

    return parseInt(result.rows[0]?.count || '0', 10) > 0;
  } catch (error) {
    console.error('[ActivityLogger] Failed to check daily checkin:', error);
    return false;
  }
}

/**
 * Gets consecutive checkin streak for a user
 */
export async function getCheckinStreak(userId: string): Promise<number> {
  try {
    const result = await query(
      `WITH daily_checkins AS (
        SELECT DISTINCT DATE(created_at) as checkin_date
        FROM badges_activity_logs
        WHERE user_id = $1
          AND activity_type = $2
        ORDER BY checkin_date DESC
      ),
      numbered AS (
        SELECT
          checkin_date,
          ROW_NUMBER() OVER (ORDER BY checkin_date DESC) as rn,
          checkin_date - (ROW_NUMBER() OVER (ORDER BY checkin_date DESC))::int as grp
        FROM daily_checkins
      )
      SELECT COUNT(*) as streak
      FROM numbered
      WHERE grp = (SELECT checkin_date - 1 FROM numbered WHERE rn = 1)
      GROUP BY grp
      ORDER BY streak DESC
      LIMIT 1`,
      [userId, ACTIVITY_TYPES.DAILY_CHECKIN]
    );

    return parseInt(result.rows[0]?.streak || '0', 10);
  } catch (error) {
    console.error('[ActivityLogger] Failed to get checkin streak:', error);
    return 0;
  }
}
