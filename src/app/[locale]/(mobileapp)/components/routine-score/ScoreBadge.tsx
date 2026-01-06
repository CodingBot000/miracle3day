'use client';

import { getScoreGrade } from '@/lib/skincare/routineScoreCalculator';

interface ScoreBadgeProps {
  score: number;
  isHidden: boolean;
  onToggleHide: () => void;
  onPress: () => void;
}

export default function ScoreBadge({
  score,
  isHidden,
  onToggleHide,
  onPress
}: ScoreBadgeProps) {
  const { color, emoji } = getScoreGrade(score);

  // 숨김 상태일 때 작은 아이콘만 표시
  if (isHidden) {
    return (
      <button
        onClick={onToggleHide}
        className="fixed top-[100px] right-4 z-40 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 active:scale-95 transition-transform"
        aria-label="Show routine score"
      >
        <span className="text-lg">📊</span>
      </button>
    );
  }

  return (
    <div className="fixed top-[100px] right-4 z-40">
      <div
        className="relative bg-white rounded-2xl shadow-lg border-2 overflow-hidden"
        style={{ borderColor: color }}
      >
        {/* 메인 버튼 영역 */}
        <button
          onClick={onPress}
          className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          {/* 점수 아이콘 */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: color }}
          >
            {score >= 100 ? emoji : score}
          </div>

          {/* 점수 텍스트 */}
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-500 font-medium">Routine Score</span>
            <div className="flex items-center gap-1">
              <span
                className="text-lg font-bold"
                style={{ color }}
              >
                {score}점
              </span>
              <span className="text-sm">{emoji}</span>
            </div>
          </div>

          {/* 펼치기 아이콘 */}
          <svg
            className="w-4 h-4 text-gray-400 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* 닫기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleHide();
          }}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          aria-label="Hide score badge"
        >
          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
