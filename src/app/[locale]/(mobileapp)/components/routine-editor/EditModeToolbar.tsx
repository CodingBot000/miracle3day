'use client';

import { getScoreGrade } from '@/lib/skincare/routineScoreCalculator';

interface EditModeToolbarProps {
  score: number;
  hasChanges: boolean;
  onCancel: () => void;
  onAutoSort: () => void;
  onSave: () => void;
  onAddStep: () => void;
  locale?: string;
}

export default function EditModeToolbar({
  score,
  hasChanges,
  onCancel,
  onAutoSort,
  onSave,
  onAddStep,
  locale = 'ko'
}: EditModeToolbarProps) {
  const isKo = locale === 'ko';
  const { color, emoji } = getScoreGrade(score);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* 취소 버튼 */}
        <button
          onClick={onCancel}
          className="text-gray-600 font-medium hover:text-gray-800 transition-colors"
        >
          {isKo ? '취소' : 'Cancel'}
        </button>

        {/* 타이틀 + 점수 */}
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-gray-900">
            {isKo ? '루틴 편집' : 'Edit Routine'}
          </h1>
          <span
            className="text-sm font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {score}점 {emoji}
          </span>
        </div>

        {/* 자동 정렬 버튼 */}
        <button
          onClick={onAutoSort}
          className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">{isKo ? '자동정렬' : 'Auto'}</span>
        </button>
      </div>

      {/* 하단 액션 바 */}
      <div className="flex items-center gap-3 px-4 pb-3">
        {/* 스텝 추가 버튼 */}
        <button
          onClick={onAddStep}
          className="flex-1 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {isKo ? '스텝 추가' : 'Add Step'}
        </button>

        {/* 저장 버튼 */}
        <button
          onClick={onSave}
          disabled={!hasChanges}
          className={`
            flex-1 py-2.5 rounded-xl font-semibold transition-colors
            ${hasChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isKo ? '저장' : 'Save'}
        </button>
      </div>
    </div>
  );
}
