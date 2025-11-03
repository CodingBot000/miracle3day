'use client';

import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { useState } from 'react';
import { toast } from 'sonner';

interface AnswerItemProps {
  answer: any;
  index: number;
  questionId: number;
  currentUserUuid: string | null;
  onAnswerUpdated: (updatedAnswer: any) => void;
}

export default function AnswerItem({ answer, index, questionId, currentUserUuid, onAnswerUpdated }: AnswerItemProps) {
  const { language } = useCookieLanguage();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(answer.like_count || 0);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [isSaving, setIsSaving] = useState(false);

  const isOwner = currentUserUuid && answer.uuid_author === currentUserUuid;

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);

    // TODO: 좋아요 API 구현 (Phase 5)
    toast.success('좋아요 기능은 곧 추가됩니다!');

    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(answer.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error(language === 'ko' ? '답변 내용을 입력해주세요' : 'Please enter your answer content');
      return;
    }

    if (editContent.length < 10) {
      toast.error(language === 'ko' ? '답변은 최소 10자 이상 작성해주세요' : 'Answer must be at least 10 characters long');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(`/api/community/daily-questions/${questionId}/answers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answerId: answer.id, content: editContent })
      });

      if (res.ok) {
        const { answer: updatedAnswer } = await res.json();
        toast.success(language === 'ko' ? '✏️ 답변이 수정되었습니다!' : '✏️ Answer has been updated!');
        onAnswerUpdated(updatedAnswer);
        setIsEditing(false);
      } else {
        const { error } = await res.json();
        toast.error(error || (language === 'ko' ? '답변 수정에 실패했습니다' : 'Failed to update answer'));
      }
    } catch (error) {
      console.error('Edit answer error:', error);
      toast.error(language === 'ko' ? '답변 수정 중 오류가 발생했습니다' : 'Failed to update answer');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`border-2 rounded-xl p-5 transition-all ${
      answer.is_best
        ? 'border-yellow-400 bg-yellow-50/50'
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* 베스트 배지 */}
      {answer.is_best && (
        <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-sm font-bold mb-3">
          <span>⭐</span>
          <span>{language === 'ko' ? '베스트 답변' : 'Best Answer'}</span>
        </div>
      )}

      {/* 작성자 정보 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
          {answer.author_name_snapshot?.charAt(0) || 'U'}
        </div>
        <div>
          <div className="font-semibold text-gray-900">
            {answer.author_name_snapshot || 'Anonymous'}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(answer.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* 답변 내용 */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[150px] px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
            disabled={isSaving}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500">
              {editContent.length} {language === 'ko' ? '자' : 'characters'} {editContent.length >= 10 ? '✓' : (language === 'ko' ? '(최소 10자)' : '(Minimum 10 characters)')}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-gray-800 leading-relaxed whitespace-pre-line mb-4">
          {answer.content}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving || editContent.length < 10}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isSaving || editContent.length < 10
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <span>💾</span>
              <span>{isSaving ? (language === 'ko' ? '저장 중...' : 'Saving...') : (language === 'ko' ? '저장' : 'Save')}</span>
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              <span>❌</span>
              <span>{language === 'ko' ? '취소' : 'Cancel'}</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                liked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <span>{liked ? '❤️' : '🤍'}</span>
              <span>{language === 'ko' ? '좋아요' : 'Like'} {likeCount}</span>
            </button>

            {isOwner && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
              >
                <span>✏️</span>
                <span>{language === 'ko' ? '수정' : 'Edit'}</span>
              </button>
            )}

            {!answer.is_best && (
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                <span>🏆</span>
                <span>{language === 'ko' ? '베스트 선정' : 'Best Selection'}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
