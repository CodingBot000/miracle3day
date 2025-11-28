'use client'

import { useState } from 'react';
import { CommunityComment, Member } from '@/app/models/communityData.dto';
import CommentItem from './CommentItem';
import { toast } from 'sonner';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { useRouter } from 'next/navigation';
import { useLoginGuard } from '@/hooks/useLoginGuard';
import { handleNotifications } from '@/utils/notificationHandler';
import LevelUpModal from '@/components/gamification/LevelUpModal';
import type { LevelUpNotification } from '@/types/badge';

interface CommentSectionProps {
  postId: number
  comments: CommunityComment[]
  currentUser: Member | null
}

export default function CommentSection({
  postId,
  comments: initialComments,
  currentUser,
}: CommentSectionProps) {
  const { language } = useCookieLanguage();
  const router = useRouter();
  const { requireLogin, loginModal } = useLoginGuard();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [levelUp, setLevelUp] = useState<LevelUpNotification | null>(null);

  const countComments = (items: CommunityComment[]): number => {
    return items.reduce((total, item) => {
      const replies = item.replies ?? [];
      return total + 1 + countComments(replies);
    }, 0);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to submit comment');
      }

      const data = await res.json();
      if (data?.comment) {
        const newCommentWithReplies = {
          ...data.comment,
          replies: data.comment.replies ?? [],
        } as CommunityComment;

        const nextComments = [...comments, newCommentWithReplies];
        setComments(nextComments);
        setNewComment('');

        // Handle badge notifications
        if (data?.notifications) {
          const levelUpNotification = handleNotifications(data.notifications);
          if (levelUpNotification) {
            setLevelUp(levelUpNotification);
          }
        }

        // 서버 데이터 재검증 (백그라운드)
        router.refresh();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.success('An error occurred while posting the comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await fetch(`/api/community/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to delete comment');
      }

      const removeComment = (items: CommunityComment[]): CommunityComment[] => {
        return items
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies ? removeComment(c.replies) : [],
          }));
      };

      const nextComments = removeComment(comments);
      setComments(nextComments);

      // 서버 데이터 재검증 (백그라운드)
      router.refresh();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.success('An error occurred while deleting the comment.');
    }
  };

  const handleReplySubmit = async (parentId: number, content: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to submit reply');
      }

      const data = await res.json();
      if (data?.comment) {
        const replyWithAuthor = {
          ...data.comment,
          replies: data.comment.replies ?? [],
        } as CommunityComment;

        const addReply = (items: CommunityComment[]): CommunityComment[] => {
          return items.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), replyWithAuthor],
              };
            }
            return {
              ...c,
              replies: c.replies ? addReply(c.replies) : [],
            };
          });
        };

        const nextComments = addReply(comments);
        setComments(nextComments);

        // 서버 데이터 재검증 (백그라운드)
        router.refresh();
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.success('An error occurred while posting the reply.');
    }
  };

  const totalComments = countComments(comments);

  return (
    <>
      {loginModal}
      <div className="mt-8 pt-8 border-t">
        <h3 className="text-sm md:text-3xl font-semibold mb-2">
          {totalComments} {language === 'ko' ? '댓글' : 'Comments'}
        </h3>

        {currentUser ? (
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={language === 'ko' ? '댓글을 작성해주세요.' : 'Please write a comment.'}
              className="w-full p-4 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? (language === 'ko' ? '게시 중...' : 'Posting...')
                  : (language === 'ko' ? '댓글 작성' : 'Post Comment')}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600 mb-4">
              {language === 'ko'
                ? '로그인해야 댓글 작성이 가능합니다.'
                : 'You must be logged in to post a comment.'}
            </p>
            <button
              onClick={() => requireLogin()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {language === 'ko' ? '로그인' : 'Login'}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onDelete={handleDeleteComment}
              onReply={handleReplySubmit}
              depth={0}
            />
          ))}
        </div>

        {/* Level-up modal */}
        {levelUp && (
          <LevelUpModal
            level={levelUp.level}
            exp={levelUp.exp}
            onClose={() => setLevelUp(null)}
          />
        )}
      </div>
    </>
  )
}
