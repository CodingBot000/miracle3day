'use client';

import { useCookieLanguage } from '@/hooks/useCookieLanguage';

interface PollOption {
  id: number;
  option_text: any; // JSONB: {en: string, ko: string}
  vote_count: number;
  display_order: number;
  is_selected_by_user?: boolean;
}

interface PollResultsPreviewProps {
  question: {
    id: number;
    title: any; // JSONB
    subtitle?: any; // JSONB
    points_reward: number;
    poll_options: PollOption[];
    user_has_voted?: boolean;
  };
}

export default function PollResultsPreview({ question }: PollResultsPreviewProps) {
  const { language } = useCookieLanguage();

  // 다국어 텍스트 추출 헬퍼
  const getText = (jsonbField: any): string => {
    if (!jsonbField) return '';
    if (typeof jsonbField === 'string') return jsonbField;
    return jsonbField[language] || jsonbField.en || jsonbField.ko || '';
  };

  const totalVotes = question.poll_options.reduce(
    (sum: number, opt: PollOption) => sum + opt.vote_count,
    0
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
          {language === 'ko' ? '📊 QUICK POLL · 결과' : '📊 QUICK POLL · Results'}
        </span>
        <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">
          +{question.points_reward} pts
        </span>
        {question.user_has_voted && (
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
            ✓ {language === 'ko' ? '투표완료' : 'Voted'}
          </span>
        )}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{getText(question.title)}</h3>
      {question.subtitle && <p className="text-gray-600 mb-4">{getText(question.subtitle)}</p>}

      <div className="space-y-3 mt-4">
        {question.poll_options.map((option) => {
          const percentage = totalVotes > 0
            ? Math.round((option.vote_count / totalVotes) * 100)
            : 0;

          const isSelected = option.is_selected_by_user;

          return (
            <div
              key={option.id}
              className={`w-full relative overflow-hidden p-4 rounded-lg border-2 ${
                isSelected
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {/* Progress Bar */}
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

                {/* 투표 결과 표시 */}
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
            </div>
          );
        })}
      </div>

      {/* 총 투표수 표시 */}
      {totalVotes > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            👥 {totalVotes} {language === 'ko' ? '명이 투표했습니다' : 'people voted'}
          </p>
          <button className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors">
            {language === 'ko' ? '댓글보기' : 'View Comments'}
          </button>
        </div>
      )}
    </div>
  );
}

