'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLoginGuard } from '@/hooks/useLoginGuard';
import { useLocale } from 'next-intl';

interface AnswerFormProps {
  questionId: number;
  pointsReward: number;
  isAuthenticated: boolean;
}

export default function AnswerForm({ questionId, pointsReward, isAuthenticated }: AnswerFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const { requireLogin, loginModal } = useLoginGuard();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requireLogin()) {
      return;
    }

    if (!content.trim()) {
      toast.success('답변 내용을 입력해주세요');
      return;
    }

    if (content.length < 10) {
      toast.success(locale === 'ko' ? '답변은 최소 10자 이상 작성해주세요' : 'Answer must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/community/daily-questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isFirstAnswer) {
          toast.success(`🎉 답변이 등록되었습니다! +${pointsReward} 포인트 획득!`);
        } else {
          toast.success('💬 답변이 추가로 등록되었습니다!');
        }
        setContent('');
        router.refresh();
      } else {
        const { error } = await res.json();
        toast.error(error || '답변 등록에 실패했습니다');
      }
    } catch (error) {
      console.error('Submit answer error:', error);
      toast.error('답변 등록 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={locale === 'ko' ? '당신의 경험과 조언을 공유해주세요... (최소 10자)' : 'Share your experience and advice... (Minimum 10 characters)'}
          className="w-full min-h-[150px] px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
          disabled={loading}
        />

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {content.length} {locale === 'ko' ? '자' : 'characters'} {content.length >= 10 ? '✓' : (locale === 'ko' ? '(최소 10자)' : '(Minimum 10 characters)')}
          </span>

          <button
            type="submit"
            disabled={loading || content.length < 10}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              loading || content.length < 10
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-700 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (locale === 'ko' ? '등록 중...' : 'Registering...') : (locale === 'ko' ? `답변 등록 (+${pointsReward} 포인트)` : `Submit Answer (+${pointsReward} points)`)}
          </button>
        </div>
      </form>
      {loginModal}
    </>
  );
}
