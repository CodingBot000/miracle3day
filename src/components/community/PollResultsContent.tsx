'use client';

import { useState } from 'react';
import PollResultsChart from './PollResultsChart';
import PollCommentSection from './PollCommentSection';
import BackButton from '@/components/common/BackButton';
import { useLocale, useTranslations } from 'next-intl';
import type { PollQuestion, PollOption, PollVote } from '@/services/poll';
import type { PollComment } from '@/services/pollComments';

interface PollResultsContentProps {
  question: PollQuestion;
  options: PollOption[];
  userVote: PollVote | null;
  initialComments: PollComment[];
  isAuthenticated: boolean;
  memberUuid: string | null;
}

export default function PollResultsContent({
  question,
  options,
  userVote,
  initialComments,
  isAuthenticated,
  memberUuid,
}: PollResultsContentProps) {
  const locale = useLocale();
  const [comments, setComments] = useState(initialComments);

  // 다국어 텍스트 추출 헬퍼
  const getText = (jsonbField: any): string => {
    if (!jsonbField) return '';
    if (typeof jsonbField === 'string') return jsonbField;
    return jsonbField[locale] || jsonbField.en || jsonbField.ko || '';
  };

  // 댓글 추가 핸들러
  const handleCommentAdded = (newComment: PollComment) => {
    setComments(prev => [...prev, newComment]);
  };

  // 댓글 삭제 핸들러
  const handleCommentDeleted = (commentId: number) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId ? { ...c, is_deleted: true } : c
      )
    );
  };

  const questionTitle = getText(question.title);
  const questionSubtitle = question.subtitle ? getText(question.subtitle) : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="mb-6">
        <BackButton />
        <h1 className="text-2xl md:text-3xl font-bold mt-4 mb-2">{questionTitle}</h1>
        {questionSubtitle && (
          <p className="text-gray-600">{questionSubtitle}</p>
        )}
      </div>

      {/* 투표 결과 차트 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <PollResultsChart
          options={options}
          userVote={userVote}
        />
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-200 my-8" />

      {/* 댓글 섹션 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">
          {locale === 'ko' ? '댓글' : 'Comments'} ({comments.filter(c => !c.is_deleted).length})
        </h2>
        <PollCommentSection
          questionId={question.id}
          comments={comments}
          isAuthenticated={isAuthenticated}
          memberUuid={memberUuid}
          onCommentAdded={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      </div>
    </div>
  );
}

