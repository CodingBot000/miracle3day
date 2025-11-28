'use client';

import React from 'react';
import { useMobileAppState } from '@/app/[locale]/(site)/mobile/state/mobileAppState';
import { MonthlyCalendar } from './components/MonthlyCalendar';

export function MonthlyRoutineView() {
  const { monthlyStats } = useMobileAppState();

  return (
    <div className="px-4 pb-20 pt-3 space-y-4">
      <MonthlyCalendar stats={monthlyStats} />

      <section className="rounded-2xl border border-neutral-100 bg-white px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-900 mb-1">
          이번 달 변화 요약
        </h2>
        <p className="text-[11px] text-neutral-600">
          이번 달 평균 루틴 완료율은{' '}
          <span className="font-semibold text-emerald-600">
            {Math.round(monthlyStats.averageCompletionRate * 100)}%
          </span>
          로, 지난 달보다{' '}
          {monthlyStats.previousMonthCompletionRate
            ? Math.round(
                (monthlyStats.averageCompletionRate -
                  monthlyStats.previousMonthCompletionRate) *
                  100
              )
            : 0}
          %p 변화했어요.
        </p>
        {monthlyStats.bestDayOfWeek && (
          <p className="text-[11px] text-neutral-500 mt-2">
            💪 가장 루틴을 잘 지킨 요일은 <strong>{monthlyStats.bestDayOfWeek}</strong>입니다.
          </p>
        )}
        {monthlyStats.mostMissedStepId && (
          <p className="text-[11px] text-neutral-500 mt-1">
            💡 가장 자주 놓친 스텝: <strong>{monthlyStats.mostMissedStepId}</strong>
          </p>
        )}
      </section>

      {/* TODO: 배지/시즌 요약 간단 표시 */}
      <section className="rounded-2xl border border-neutral-100 bg-white px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-900 mb-1">
          이번 달 획득 배지
        </h2>
        <p className="text-[11px] text-neutral-500">
          꾸준한 루틴으로 새로운 배지를 획득하세요!
        </p>
        <div className="flex gap-2 mt-3">
          <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center text-xl">
            🏆
          </div>
          <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center text-xl">
            ⭐
          </div>
          <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center text-xl">
            💎
          </div>
        </div>
      </section>
    </div>
  );
}
