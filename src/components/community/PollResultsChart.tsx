'use client';

import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import type { PollOption } from '@/services/poll';
import type { PollVote } from '@/services/poll';

interface PollResultsChartProps {
  options: PollOption[];
  userVote: PollVote | null;
}

export default function PollResultsChart({
  options,
  userVote,
}: PollResultsChartProps) {
  const { language } = useCookieLanguage();

  // 다국어 텍스트 추출 헬퍼
  const getText = (jsonbField: any): string => {
    if (!jsonbField) return '';
    if (typeof jsonbField === 'string') return jsonbField;
    return jsonbField[language] || jsonbField.en || jsonbField.ko || '';
  };

  const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);

  return (
    <div className="poll-results-chart">
      <h2 className="text-xl font-bold mb-4">
        {language === 'ko' ? '투표 결과' : 'Poll Results'}
      </h2>
      
      <div className="space-y-3">
        {options.map((option) => {
          const percentage = totalVotes > 0
            ? Math.round((option.vote_count / totalVotes) * 100)
            : 0;

          const isSelected = option.is_selected_by_user || (userVote && userVote.id_option === option.id);

          return (
            <div
              key={option.id}
              className={`w-full relative overflow-hidden p-4 rounded-lg border-2 border-solid transition ${
                isSelected
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-white hover:border-green-500 hover:bg-green-50'
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
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            👥 {totalVotes} {language === 'ko' ? '명이 투표했습니다' : 'people voted'}
          </p>
        </div>
      )}
    </div>
  );
}

