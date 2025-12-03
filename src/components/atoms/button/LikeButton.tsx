'use client'

import { useState } from 'react';
import { useLoginGuard } from '@/hooks/useLoginGuard';
import { handleNotifications } from '@/utils/notificationHandler';
import LevelUpModal from '@/components/gamification/LevelUpModal';
import type { LevelUpNotification } from '@/types/badge';

interface LikeButtonProps {
  postId: number;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
}

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
  isAuthenticated,
}: LikeButtonProps) {
  const { requireLogin, loginModal } = useLoginGuard();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [levelUp, setLevelUp] = useState<LevelUpNotification | null>(null);

  const handleToggleLike = async () => {
    // Check login before allowing like/unlike
    if (!requireLogin()) {
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isLiked) {
        const res = await fetch(`/api/community/posts/${postId}/likes`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || 'Failed to unlike');
        }

        const data = await res.json();
        setIsLiked(false);
        setLikesCount(data?.count ?? likesCount - 1);
      } else {
        const res = await fetch(`/api/community/posts/${postId}/likes`, {
          method: 'POST',
        });

        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || 'Failed to like');
        }

        const data = await res.json();
        setIsLiked(true);
        setLikesCount(data?.count ?? likesCount + 1);

        // Handle badge notifications (only for like, not unlike)
        if (data?.notifications) {
          const levelUpNotification = handleNotifications(data.notifications);
          if (levelUpNotification) {
            setLevelUp(levelUpNotification);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleToggleLike}
        disabled={isLoading}
        className={`flex items-center text-xs md:text-sm gap-1 px-3 py-1 rounded-full transition-colors ${
          isLiked
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span>{isLiked ? '❤️' : '🤍'}</span>
        <span>{likesCount}</span>
      </button>
      {loginModal}

      {/* Level-up modal */}
      {levelUp && (
        <LevelUpModal
          level={levelUp.level}
          exp={levelUp.exp}
          onClose={() => setLevelUp(null)}
        />
      )}
    </>
  )
}
