'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import PollCommentInput from './PollCommentInput';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import type { PollComment } from '@/services/pollComments';

interface PollCommentItemProps {
  comment: PollComment & { children?: PollComment[] };
  memberUuid: string | null;
  onReply: (content: string, parentId: number) => void;
  onDelete: (commentId: number) => void;
}

export default function PollCommentItem({
  comment,
  memberUuid,
  onReply,
  onDelete,
}: PollCommentItemProps) {
  const { language } = useCookieLanguage();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthor = memberUuid === comment.uuid_author;
  const authorName = comment.is_anonymous 
    ? (language === 'ko' ? '익명' : 'Anonymous')
    : comment.author?.name || (language === 'ko' ? '사용자' : 'User');

  const handleReplySubmit = async (content: string) => {
    setIsSubmitting(true);
    await onReply(content, comment.id);
    setIsSubmitting(false);
    setShowReplyInput(false);
  };

  return (
    <div className="poll-comment-item">
      {/* 댓글 헤더 */}
      <div className="flex items-start gap-3">
        {/* 아바타 */}
        <div className="flex-shrink-0">
          {comment.is_anonymous ? (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600">?</span>
            </div>
          ) : comment.author?.avatar_url ? (
            <Image
              src={comment.author.avatar_url}
              alt={authorName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-pink-600 font-semibold">
                {authorName[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* 댓글 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{authorName}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          <div className="text-sm text-gray-800 mb-2">
            {comment.is_deleted ? (
              <span className="italic text-gray-400">
                {language === 'ko' ? '삭제된 댓글입니다' : 'Deleted comment'}
              </span>
            ) : (
              comment.content
            )}
          </div>

          {/* 액션 버튼 */}
          {!comment.is_deleted && (
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-gray-600 hover:text-pink-500 font-medium"
              >
                {language === 'ko' ? '답글' : 'Reply'}
              </button>
              {isAuthor && (
                <button
                  onClick={() => {
                    if (confirm(language === 'ko' ? '댓글을 삭제하시겠습니까?' : 'Are you sure you want to delete this comment?')) {
                      onDelete(comment.id);
                    }
                  }}
                  className="text-gray-600 hover:text-red-500 font-medium"
                >
                  {language === 'ko' ? '삭제' : 'Delete'}
                </button>
              )}
            </div>
          )}

          {/* 답글 입력창 */}
          {showReplyInput && (
            <div className="mt-3">
              <PollCommentInput
                onSubmit={handleReplySubmit}
                isSubmitting={isSubmitting}
                isAuthenticated={true}
                placeholder={language === 'ko' ? `${authorName}님에게 답글 작성...` : `Reply to ${authorName}...`}
                showCancel
                onCancel={() => setShowReplyInput(false)}
              />
            </div>
          )}

          {/* 대댓글 렌더링 */}
          {comment.children && comment.children.length > 0 && (
            <div className="mt-4 ml-4 space-y-4 border-l-2 border-gray-200 pl-4">
              {comment.children.map((child) => (
                <PollCommentItem
                  key={child.id}
                  comment={child}
                  memberUuid={memberUuid}
                  onReply={onReply}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

