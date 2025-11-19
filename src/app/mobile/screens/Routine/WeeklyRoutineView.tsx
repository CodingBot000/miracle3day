'use client';

import React from 'react';
import { useMobileAppState } from '@/app/mobile/state/mobileAppState';
import { WeeklySummaryCard } from './components/WeeklySummaryCard';

export function WeeklyRoutineView() {
  const { weeklyStats } = useMobileAppState();

  return (
    <div className="px-4 pb-20 pt-3 space-y-4">
      <WeeklySummaryCard stats={weeklyStats} />

      {/* TODO: 요일별 행렬/히트맵 */}
      {/* 간단한 placeholder 구현 후 점진적으로 개선 */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-900 mb-2">
          요일별 루틴 패턴
        </h2>
        <p className="text-[11px] text-neutral-500">
          이번 주 어떤 요일에 루틴을 잘 지켰는지 한눈에 보여드려요.
        </p>

        {/* 간단한 바 리스트 */}
        <div className="mt-3 space-y-2">
          {Object.entries(weeklyStats.dailyCompletionRates)
            .slice(0, 7)
            .map(([date, rate]) => (
              <div key={date} className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-600 w-20">{date}</span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${rate * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-neutral-600 w-10 text-right">
                  {Math.round(rate * 100)}%
                </span>
              </div>
            ))}
        </div>
      </section>

      {/* TODO: 주간 미션/챌린지 카드 */}
      <section className="rounded-2xl border border-neutral-100 bg-white px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900 mb-1">
          주간 목표 달성률
        </h3>
        <p className="text-[11px] text-neutral-500">
          설정한 주간 목표를 향해 꾸준히 나아가고 있어요.
        </p>
      </section>
    </div>
  );
}
