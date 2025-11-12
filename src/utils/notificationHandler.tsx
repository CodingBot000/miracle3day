import { toast } from 'sonner';
import type { Notification, BadgeNotification, LevelUpNotification } from '@/types/badge';

/**
 * Display badge notification (fancy toast)
 */
function showBadgeNotification(notification: BadgeNotification) {
  const { badge, points } = notification;
  const badgeName = typeof badge.name === 'object'
    ? (badge.name.en || badge.name.ko || 'Badge')
    : badge.name;

  toast.success(
    <div className="flex flex-col gap-1">
      <div className="font-semibold">🎉 Congratulations!</div>
      <div className="flex items-center gap-2">
        <span>🏆</span>
        <span>{badgeName} Badge Earned!</span>
      </div>
      <div className="text-sm text-gray-600">
        Level {badge.level} achieved (+{points} points)
      </div>
    </div>,
    {
      duration: 5000,
      className: 'bg-white',
    }
  );
}

/**
 * Get level-up notification (for modal trigger)
 */
function getLevelUpNotification(notification: LevelUpNotification): LevelUpNotification {
  return notification;
}

/**
 * Process notification array
 * @returns Level-up notification (for modal display) or null
 */
export function handleNotifications(notifications: Notification[]): LevelUpNotification | null {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  let levelUpNotification: LevelUpNotification | null = null;

  for (const notification of notifications) {
    if (notification.type === 'badge') {
      showBadgeNotification(notification);
    } else if (notification.type === 'levelup') {
      levelUpNotification = notification;
    }
  }

  // Level-up is shown via modal instead of toast
  return levelUpNotification;
}
