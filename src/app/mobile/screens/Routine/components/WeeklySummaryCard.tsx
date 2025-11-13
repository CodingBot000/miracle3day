'use client';

import React from 'react';
import type { WeeklyRoutineStats } from '../../../state/routineTypes';

interface Props {
  stats: WeeklyRoutineStats;
}

export function WeeklySummaryCard({ stats }: Props) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-4 py-3">
      <h3 className="text-sm font-semibold text-neutral-900 mb-3">
        이번 주 루틴 완료 현황
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-2 rounded-lg bg-neutral-50">
          <span className="text-[11px] text-neutral-600 mb-1">AM 루틴</span>
          <span className="text-lg font-semibold text-emerald-600">
            {Math.round(stats.amCompletionRate * 100)}%
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-neutral-50">
          <span className="text-[11px] text-neutral-600 mb-1">PM 루틴</span>
          <span className="text-lg font-semibold text-emerald-600">
            {Math.round(stats.pmCompletionRate * 100)}%
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-neutral-50">
          <span className="text-[11px] text-neutral-600 mb-1">스페셜</span>
          <span className="text-lg font-semibold text-emerald-600">
            {Math.round(stats.specialCompletionRate * 100)}%
          </span>
        </div>
      </div>

      <p className="text-[11px] text-neutral-500 mt-3">
        이번 주는 AM 루틴을 가장 잘 지켜냈어요! 꾸준히 실천해봐요.
      </p>
    </div>
  );
}
