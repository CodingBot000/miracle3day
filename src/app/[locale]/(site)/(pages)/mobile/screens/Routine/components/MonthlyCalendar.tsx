'use client';

import React from 'react';
import type { MonthlyRoutineStats } from '@/app/[locale]/(site)/(pages)/mobile/state/routineTypes';

interface Props {
  stats: MonthlyRoutineStats;
}

export function MonthlyCalendar({ stats }: Props) {
  // 간단한 히트맵 캘린더 구현
  const dates = Object.keys(stats.dailyCompletionRates).sort();

  const getColorForRate = (rate: number) => {
    if (rate >= 0.8) return 'bg-emerald-500';
    if (rate >= 0.6) return 'bg-emerald-400';
    if (rate >= 0.4) return 'bg-emerald-300';
    if (rate >= 0.2) return 'bg-emerald-200';
    return 'bg-neutral-100';
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-4 py-3">
      <h3 className="text-sm font-semibold text-neutral-900 mb-1">
        {stats.month} 월간 캘린더
      </h3>
      <p className="text-[11px] text-neutral-500 mb-3">
        날짜별 루틴 완료율을 색상으로 표현했어요.
      </p>

      <div className="grid grid-cols-7 gap-1">
        {dates.slice(0, 28).map(date => {
          const day = date.split('-')[2];
          const rate = stats.dailyCompletionRates[date] || 0;

          return (
            <div
              key={date}
              className={`aspect-square rounded flex items-center justify-center ${getColorForRate(
                rate
              )}`}
            >
              <span className="text-[10px] font-medium text-neutral-700">
                {day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-neutral-500">낮음</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded bg-neutral-100" />
            <div className="w-3 h-3 rounded bg-emerald-200" />
            <div className="w-3 h-3 rounded bg-emerald-300" />
            <div className="w-3 h-3 rounded bg-emerald-400" />
            <div className="w-3 h-3 rounded bg-emerald-500" />
          </div>
          <span className="text-[10px] text-neutral-500">높음</span>
        </div>
      </div>
    </div>
  );
}
