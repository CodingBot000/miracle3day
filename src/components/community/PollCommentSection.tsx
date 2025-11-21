'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import PollCommentItem from './PollCommentItem';
import PollCommentInput from './PollCommentInput';
import { buildCommentTree } from '@/utils/commentTree';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import type { PollComment } from '@/services/pollComments';

interface PollCommentSectionProps {
  questionId: number;
  comments: PollComment[];
  isAuthenticated: boolean;
  memberUuid: string | null;
  onCommentAdded: (comment: PollComment) => void;
  onCommentDeleted: (commentId: number) => void;
}

export default function PollCommentSection({
  questionId,
  comments,
  isAuthenticated,
  memberUuid,
  onCommentAdded,
  onCommentDeleted,
}: PollCommentSectionProps) {
  const { language } = useCookieLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 댓글 트리 구조로 변환
  const commentTree = buildCommentTree(comments);

  // 댓글 작성
  const handleSubmitComment = async (content: string, parentId?: number) => {
    if (!isAuthenticated) {
      toast.error(language === 'ko' ? '로그인이 필요합니다' : 'Please login to comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/community/poll-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          content,
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const newComment = await response.json();
      onCommentAdded(newComment);
      toast.success(language === 'ko' ? '댓글이 작성되었습니다!' : 'Comment posted!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(language === 'ko' ? '댓글 작성에 실패했습니다' : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`/api/community/poll-comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      onCommentDeleted(commentId);
      toast.success(language === 'ko' ? '댓글이 삭제되었습니다' : 'Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(language === 'ko' ? '댓글 삭제에 실패했습니다' : 'Failed to delete comment');
    }
  };

  return (
    <div className="poll-comment-section">
      {/* 댓글 입력창 */}
      <div className="mb-6">
        <PollCommentInput
          onSubmit={handleSubmitComment}
          isSubmitting={isSubmitting}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* 댓글 리스트 */}
      <div className="space-y-4">
        {commentTree.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {language === 'ko' 
              ? '아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!' 
              : 'No comments yet. Be the first to share your thoughts!'
            }
          </p>
        ) : (
          commentTree.map(comment => (
            <PollCommentItem
              key={comment.id}
              comment={comment}
              memberUuid={memberUuid}
              onReply={handleSubmitComment}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
}

