'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type {
  RoutinePeriod,
  DailyRoutineState,
  WeeklyRoutineStats,
  MonthlyRoutineStats,
  ChallengeSummary,
} from './routineTypes';
import { createInitialDailyRoutine, createMockWeeklyStats, createMockMonthlyStats, createMockChallengeSummary } from './routineMockData';

type MobileTab = 'routine' | 'community' | 'my'; // 현재는 routine만 구현, 나머지는 Placeholder 사용

interface MobileAppState {
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;

  routinePeriod: RoutinePeriod;
  setRoutinePeriod: (period: RoutinePeriod) => void;

  todayRoutine: DailyRoutineState;
  toggleStepCompletion: (stepId: string) => void;
  updateTodaySurvey: (params: { skinTightnessScore?: number; note?: string }) => void;

  weeklyStats: WeeklyRoutineStats;
  monthlyStats: MonthlyRoutineStats;

  challengeSummary: ChallengeSummary;
}

const MobileAppStateContext = createContext<MobileAppState | null>(null);

export function MobileAppStateProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<MobileTab>('routine');
  const [routinePeriod, setRoutinePeriod] = useState<RoutinePeriod>('daily');

  const [todayRoutine, setTodayRoutine] = useState<DailyRoutineState>(() =>
    createInitialDailyRoutine()
  );

  const [weeklyStats] = useState<WeeklyRoutineStats>(() => createMockWeeklyStats());
  const [monthlyStats] = useState<MonthlyRoutineStats>(() => createMockMonthlyStats());
  const [challengeSummary] = useState<ChallengeSummary>(() => createMockChallengeSummary());

  const toggleStepCompletion = (stepId: string) => {
    setTodayRoutine(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.stepId === stepId ? { ...step, completed: !step.completed } : step
      ),
    }));
  };

  const updateTodaySurvey = (params: { skinTightnessScore?: number; note?: string }) => {
    setTodayRoutine(prev => ({
      ...prev,
      ...params,
    }));
  };

  const value: MobileAppState = {
    activeTab,
    setActiveTab,

    routinePeriod,
    setRoutinePeriod,

    todayRoutine,
    toggleStepCompletion,
    updateTodaySurvey,

    weeklyStats,
    monthlyStats,

    challengeSummary,
  };

  return (
    <MobileAppStateContext.Provider value={value}>
      {children}
    </MobileAppStateContext.Provider>
  );
}

export function useMobileAppState() {
  const ctx = useContext(MobileAppStateContext);
  if (!ctx) {
    throw new Error('useMobileAppState must be used within MobileAppStateProvider');
  }
  return ctx;
}
