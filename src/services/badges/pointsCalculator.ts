/**
 * Points Calculator for Badge System
 * Calculates points and experience based on user activities
 */

import { ActivityType, ACTIVITY_TYPES } from './activityLogger';

// Points awarded for each activity type
const ACTIVITY_POINTS: Record<ActivityType, number> = {
  [ACTIVITY_TYPES.POST_CREATED]: 10,
  [ACTIVITY_TYPES.COMMENT_CREATED]: 5,
  [ACTIVITY_TYPES.LIKE_GIVEN]: 1,
  [ACTIVITY_TYPES.LIKE_RECEIVED]: 2,
  [ACTIVITY_TYPES.POLL_VOTED]: 3,
  [ACTIVITY_TYPES.DAILY_CHECKIN]: 5,
};

// Experience points are typically higher than regular points
const ACTIVITY_EXP: Record<ActivityType, number> = {
  [ACTIVITY_TYPES.POST_CREATED]: 20,
  [ACTIVITY_TYPES.COMMENT_CREATED]: 10,
  [ACTIVITY_TYPES.LIKE_GIVEN]: 2,
  [ACTIVITY_TYPES.LIKE_RECEIVED]: 5,
  [ACTIVITY_TYPES.POLL_VOTED]: 8,
  [ACTIVITY_TYPES.DAILY_CHECKIN]: 10,
};

/**
 * Gets points for an activity type
 */
export function getPointsForActivity(activityType: ActivityType): number {
  return ACTIVITY_POINTS[activityType] || 0;
}

/**
 * Gets experience points for an activity type
 */
export function getExpForActivity(activityType: ActivityType): number {
  return ACTIVITY_EXP[activityType] || 0;
}

/**
 * Calculates level based on total experience
 * Uses a simple exponential formula: level = floor(sqrt(exp / 100))
 */
export function calculateLevel(totalExp: number): number {
  if (totalExp < 0) return 1;
  return Math.floor(Math.sqrt(totalExp / 100)) + 1;
}

/**
 * Calculates experience needed for next level
 */
export function expNeededForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

/**
 * Gets experience progress for current level
 */
export function getExpProgress(currentExp: number): {
  currentLevel: number;
  nextLevel: number;
  expForCurrentLevel: number;
  expForNextLevel: number;
  expProgress: number;
  expRemaining: number;
  progressPercentage: number;
} {
  const currentLevel = calculateLevel(currentExp);
  const nextLevel = currentLevel + 1;
  const expForCurrentLevel = expNeededForLevel(currentLevel);
  const expForNextLevel = expNeededForLevel(nextLevel);
  const expProgress = currentExp - expForCurrentLevel;
  const expRemaining = expForNextLevel - currentExp;
  const progressPercentage = Math.min(
    100,
    (expProgress / (expForNextLevel - expForCurrentLevel)) * 100
  );

  return {
    currentLevel,
    nextLevel,
    expForCurrentLevel,
    expForNextLevel,
    expProgress,
    expRemaining,
    progressPercentage: Math.round(progressPercentage),
  };
}

/**
 * Calculates bonus multiplier based on streak
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0; // 30+ days: 2x bonus
  if (streak >= 14) return 1.5; // 14-29 days: 1.5x bonus
  if (streak >= 7) return 1.25; // 7-13 days: 1.25x bonus
  if (streak >= 3) return 1.1; // 3-6 days: 1.1x bonus
  return 1.0; // No bonus
}

/**
 * Calculates points with streak bonus applied
 */
export function calculatePointsWithBonus(
  basePoints: number,
  streak: number
): number {
  const multiplier = getStreakMultiplier(streak);
  return Math.floor(basePoints * multiplier);
}

/**
 * Gets tier based on total points
 */
export function getTier(totalPoints: number): {
  tier: string;
  tierLevel: number;
  minPoints: number;
  maxPoints: number | null;
} {
  if (totalPoints >= 10000) {
    return {
      tier: 'Diamond',
      tierLevel: 5,
      minPoints: 10000,
      maxPoints: null,
    };
  }
  if (totalPoints >= 5000) {
    return {
      tier: 'Platinum',
      tierLevel: 4,
      minPoints: 5000,
      maxPoints: 9999,
    };
  }
  if (totalPoints >= 2000) {
    return {
      tier: 'Gold',
      tierLevel: 3,
      minPoints: 2000,
      maxPoints: 4999,
    };
  }
  if (totalPoints >= 500) {
    return {
      tier: 'Silver',
      tierLevel: 2,
      minPoints: 500,
      maxPoints: 1999,
    };
  }
  return {
    tier: 'Bronze',
    tierLevel: 1,
    minPoints: 0,
    maxPoints: 499,
  };
}
