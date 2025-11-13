'use client';

import React, { useMemo } from 'react';
import { useMobileAppState } from '../../../state/mobileAppState';
import { getStepDefinitions } from '../../../state/routineMockData';
import { ProgressRing } from './ProgressRing';
import { formatKoreanDateLabel } from '../../../lib/dateHelpers';

export function RoutineHeader() {
  const { todayRoutine } = useMobileAppState();
  const defs = getStepDefinitions();

  const completionRate = useMemo(() => {
    if (!todayRoutine.steps.length) return 0;
    const completed = todayRoutine.steps.filter(s => s.completed).length;
    return completed / todayRoutine.steps.length;
  }, [todayRoutine.steps]);

  const dateLabel = formatKoreanDateLabel(todayRoutine.date);

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <span className="text-xs text-neutral-500">{dateLabel}</span>
        <span className="text-sm font-semibold text-neutral-900">
          오늘 루틴, 천천히 차근차근 해볼까요?
        </span>
        <span className="text-[11px] text-emerald-600 mt-0.5">
          여름·고온다습 루틴 기준 · AM/PM/스페셜 포함
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ProgressRing progress={completionRate} size={52} strokeWidth={5} />
        <div className="flex flex-col items-start">
          <span className="text-xs font-semibold text-neutral-900">
            {Math.round(completionRate * 100)}%
          </span>
          <span className="text-[11px] text-neutral-500">
            {todayRoutine.steps.filter(s => s.completed).length} / {todayRoutine.steps.length} 완료
          </span>
        </div>
      </div>
    </div>
  );
}
