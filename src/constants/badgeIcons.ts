/**
 * Badge icon mappings
 * Maps badge codes to emoji icons (temporary until real badge images are uploaded)
 */

// Badge code to emoji mapping
export const BADGE_EMOJI_MAP: Record<string, string> = {
  comment_master: '💬',
  best_answer_collector: '⭐',
  poll_enthusiast: '🗳️',
  topic_explorer: '🎯',
  content_creator: '✍️',
  reaction_giver: '👍',
  weekly_mvp: '🏆',
  helpful_neighbor: '👋',
};

/**
 * Gets badge icon (image URL or emoji fallback)
 */
export function getBadgeIcon(code: string, iconUrl?: string): string {
  // Use image URL if provided and not a placeholder
  if (iconUrl && iconUrl !== '/public/icons/badges/placeholder.png') {
    return iconUrl;
  }

  // Fallback to emoji
  return BADGE_EMOJI_MAP[code] || '🎖️';
}
