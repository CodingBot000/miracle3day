'use client'

import { useState } from 'react'
import { createClient } from "@/utils/session/client";

interface LikeButtonProps {
  postId: number
  initialLiked: boolean
  initialCount: number
  userId: string
}

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
  userId
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const backendClient = createClient()

  const syncLikeCount = async (nextCount: number) => {
    const { error } = await backendClient
      .from('community_posts')
      .update({ like_count: nextCount, updated_at: new Date().toISOString() })
      .eq('id', postId)

    if (error) {
      console.error('Failed to sync like count:', error)
    }
  }

  const handleToggleLike = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      if (isLiked) {
        const { error } = await backendClient
          .from('community_likes')
          .delete()
          .eq('id_post', postId)
          .eq('uuid_member', userId)
        
        if (!error) {
          setIsLiked(false)
          setLikesCount((prev) => {
            const next = prev - 1
            void syncLikeCount(next)
            return next
          })
        }
      } else {
        const { error } = await backendClient
          .from('community_likes')
          .insert({
            id_post: postId,
            uuid_member: userId
          })
        
        if (!error) {
          setIsLiked(true)
          setLikesCount((prev) => {
            const next = prev + 1
            void syncLikeCount(next)
            return next
          })
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
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
