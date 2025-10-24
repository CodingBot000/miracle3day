'use client'

import { useState } from 'react';

interface LikeButtonProps {
  postId: number;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async () => {
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
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
        isLiked
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span>{isLiked ? '❤️' : '🤍'}</span>
      <span>{likesCount}</span>
    </button>
  )
}
