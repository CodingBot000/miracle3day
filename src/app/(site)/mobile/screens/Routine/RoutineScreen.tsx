'use client';

import React from 'react';
import { useMobileAppState } from '@/app/(site)/mobile/state/mobileAppState';
import { SegmentedControl } from './components/SegmentedControl';
import { DailyRoutineView } from './DailyRoutineView';
import { WeeklyRoutineView } from './WeeklyRoutineView';
import { MonthlyRoutineView } from './MonthlyRoutineView';
import { ChallengeFooter } from './components/ChallengeFooter';
import { RoutineHeader } from './components/RoutineHeader';

export function RoutineScreen() {
  const { routinePeriod, setRoutinePeriod } = useMobileAppState();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2 bg-neutral-50 flex items-center justify-between sticky top-0 z-10">
        <RoutineHeader />
        <SegmentedControl
          options={[
            { value: 'daily', label: '일간' },
            { value: 'weekly', label: '주간' },
            { value: 'monthly', label: '월간' },
          ]}
          value={routinePeriod}
          onChange={setRoutinePeriod}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {routinePeriod === 'daily' && <DailyRoutineView />}
        {routinePeriod === 'weekly' && <WeeklyRoutineView />}
        {routinePeriod === 'monthly' && <MonthlyRoutineView />}
      </div>

      <ChallengeFooter />
    </div>
  );
}
