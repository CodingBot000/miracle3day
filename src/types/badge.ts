/**
 * Badge system type definitions
 */

export interface Badge {
  code: string;
  name: Record<string, string>; // {ko, en}
  level: number;
  iconUrl?: string;
  earnedAt?: string;
}

export interface BadgeProgress {
  code: string;
  name: Record<string, string>;
  currentLevel: number;
  progress: number;
  threshold: number;
  iconUrl?: string;
}

export interface BadgeProfileData {
  level: number;
  points: number;
  nextLevelPoints: number;
  earnedBadges: Badge[];
  inProgressBadges: BadgeProgress[];
}

/**
 * Badge award notification
 */
export interface BadgeNotification {
  type: 'badge';
  badge: {
    code: string;
    name: Record<string, string>; // {ko, en}
    level: number;
  };
  points: number;
}

/**
 * Level-up notification
 */
export interface LevelUpNotification {
  type: 'levelup';
  level: number;
  exp: number;
}

/**
 * Unified notification type for badge system events
 */
export type Notification = BadgeNotification | LevelUpNotification;

/**
 * API response format with optional notifications
 */
export interface ActivityResponse {
  success: boolean;
  notifications?: Notification[];
  error?: string;
}
