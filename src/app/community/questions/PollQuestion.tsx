'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';

interface PollOption {
  id: number;
  option_text: any; // JSONB: {en: string, ko: string}
  vote_count: number;
  display_order: number;
  is_selected_by_user?: boolean;
}

interface PollQuestionProps {
  question: {
    id: number;
    title: any; // JSONB
    subtitle?: any; // JSONB
    points_reward: number;
    poll_options: PollOption[];
    user_has_voted?: boolean;
  };
}

export default function PollQuestion({ question }: PollQuestionProps) {
  // console.log('PollQuestion question', question);
  const { language } = useCookieLanguage();

  // 다국어 텍스트 추출 헬퍼
  const getText = (jsonbField: any): string => {
    if (!jsonbField) return '';
    if (typeof jsonbField === 'string') return jsonbField;
    return jsonbField[language] || jsonbField.en || jsonbField.ko || '';
  };

  // 서버에서 받은 투표 상태로 초기화
  const [voted, setVoted] = useState(question.user_has_voted || false);

  // 선택된 옵션 ID 추적
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
    question.poll_options?.find(opt => opt.is_selected_by_user)?.id || null
  );

  const [options, setOptions] = useState<PollOption[]>(question.poll_options || []);
  const [loading, setLoading] = useState(false);

  const handleVote = async (optionId: number) => {
    // 같은 옵션 재선택 방지
    if (optionId === selectedOptionId) {
      toast.info(language === 'ko' ? '이미 선택한 옵션입니다' : 'You already selected this option');
      return;
    }

    // 로딩 중 중복 클릭 방지
    if (loading) return;

    // Optimistic Update - 이전 상태 백업
    const previousOptions = [...options];
    const previousVoted = voted;
    const previousSelectedId = selectedOptionId;

    setLoading(true);
    setVoted(true);
    setSelectedOptionId(optionId);

    // UI 즉시 업데이트 (재투표시 이전 옵션 -1, 새 옵션 +1)
    setOptions(prevOptions =>
      prevOptions.map(opt => ({
        ...opt,
        vote_count:
          opt.id === optionId
            ? opt.vote_count + 1
            : opt.id === previousSelectedId
            ? Math.max(0, opt.vote_count - 1)
            : opt.vote_count,
        is_selected_by_user: opt.id === optionId
      }))
    );

    try {
      const res = await fetch(`/api/community/daily-questions/${question.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_option: optionId })
      });

      if (res.ok) {
        const { options: updatedOptions, voted_option_id, message } = await res.json();

        // 서버 응답으로 최종 동기화
        setOptions(updatedOptions);
        setSelectedOptionId(voted_option_id);
        setVoted(true);

        // 메시지에 따라 토스트 표시
        if (message?.includes('changed')) {
          toast.success(language === 'ko' ? '🔄 투표가 변경되었습니다!' : '🔄 Vote changed successfully!');
        } else {
          toast.success(
            language === 'ko'
              ? `🎉 +${question.points_reward} 포인트 획득!`
              : `🎉 +${question.points_reward} points earned!`
          );
        }
      } else {
        // 실패 시 롤백
        setOptions(previousOptions);
        setVoted(previousVoted);
        setSelectedOptionId(previousSelectedId);

        const { error, alreadySelected } = await res.json();

        if (alreadySelected) {
          toast.info(language === 'ko' ? '이미 선택한 옵션입니다' : 'You already selected this option');
        } else if (error === 'Already voted') {
          toast.error(language === 'ko' ? '이미 투표하셨습니다!' : 'You have already voted on this poll!');
        } else {
          toast.error(error || (language === 'ko' ? '투표 실패' : 'Failed to vote'));
        }
      }
    } catch (error) {
      // 에러 시 롤백
      setOptions(previousOptions);
      setVoted(previousVoted);
      setSelectedOptionId(previousSelectedId);

      console.error('Vote error:', error);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = options.reduce((sum: number, opt: PollOption) => sum + opt.vote_count, 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
          {language === 'ko' ? '📊 QUICK POLL · 1초 참여' : '📊 QUICK POLL · 1-sec Vote'}
        </span>
        <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">
          +{question.points_reward} pts
        </span>
        {voted && (
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
            ✓ {language === 'ko' ? '투표완료' : 'Voted'}
          </span>
        )}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{getText(question.title)}</h3>
      {question.subtitle && <p className="text-gray-600 mb-4">{getText(question.subtitle)}</p>}

      <div className="space-y-3 mt-4">
        {options.map((option) => {
          const percentage = totalVotes > 0
            ? Math.round((option.vote_count / totalVotes) * 100)
            : 0;

          const isSelected = option.is_selected_by_user || option.id === selectedOptionId;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={loading}
              className={`w-full relative overflow-hidden p-4 rounded-lg border-2 transition ${
                isSelected
                  ? 'border-green-500 bg-green-50 cursor-default'
                  : loading
                  ? 'border-gray-300 cursor-wait opacity-60'
                  : 'border-gray-300 hover:border-green-500 hover:bg-green-50 cursor-pointer'
              }`}
            >
              {/* Progress Bar - 항상 표시 */}
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                  isSelected ? 'bg-green-300 opacity-40' : 'bg-green-200 opacity-30'
                }`}
                style={{ width: totalVotes > 0 ? `${percentage}%` : '0%' }}
              />

              {/* Content */}
              <div className="relative flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <span className="text-green-600 text-xl">✓</span>
                  )}
                  <span className={`font-semibold ${isSelected ? 'text-green-800' : 'text-gray-900'}`}>
                    {getText(option.option_text)}
                  </span>
                </div>

                {/* 투표 결과는 항상 표시 (로그인 여부 무관) */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">
                    {option.vote_count} {language === 'ko' ? '표' : 'votes'}
                  </span>
                  {totalVotes > 0 && (
                    <span className={`font-bold text-lg ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 총 투표수는 항상 표시 */}
      {totalVotes > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-gray-500 text-sm">
            👥 {totalVotes} {language === 'ko' ? '명이 투표했습니다' : 'people voted'}
          </p>
          {voted && (
            <p className="text-gray-400 text-xs">
              💡 {language === 'ko'
                ? '다른 옵션을 선택하여 투표를 변경할 수 있습니다'
                : 'You can change your vote by selecting a different option'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
