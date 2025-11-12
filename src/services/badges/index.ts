/**
 * Badge System - Main exports
 */

// Activity Logger
export {
  logActivity,
  getActivityCount,
  getRecentActivities,
  hasCheckedInToday,
  getCheckinStreak,
  ACTIVITY_TYPES,
  type ActivityType,
  type ActivityLogInput,
} from './activityLogger';

// Points Calculator
export {
  getPointsForActivity,
  getExpForActivity,
  calculateLevel,
  expNeededForLevel,
  getExpProgress,
  getStreakMultiplier,
  calculatePointsWithBonus,
  getTier,
} from './pointsCalculator';

// Badge Service
export {
  getUserState,
  getAllBadges,
  getUserBadges,
  processActivity,
  processCheckin,
  getUserProfile,
  type BadgeRule,
  type UserBadgeState,
  type Badge,
} from './badgeService';
