/**
 * 온보딩 진행률 표시 컴포넌트
 *
 * 현재 단계와 전체 단계를 표시하는 프로그레스 바
 */

'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;  // 현재 단계 (1-16)
  total: number;    // 전체 단계 (16)
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  // 진행률 계산 (0-100%)
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="w-full px-6 py-4">
      {/* 진행률 텍스트 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">
          Step {current} of {total}
        </span>
        <span className="text-sm font-medium text-blue-600">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* 프로그레스 바 배경 */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* 프로그레스 바 진행 상태 */}
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`Progress: ${current} of ${total} steps completed`}
        />
      </div>
    </div>
  );
}
