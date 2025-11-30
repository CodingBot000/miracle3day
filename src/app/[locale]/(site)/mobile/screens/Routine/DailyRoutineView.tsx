'use client';

import React from 'react';
import { getStepDefinitions } from '@/app/[locale]/(site)/mobile/state/routineMockData';
import { useMobileAppState } from '@/app/[locale]/(site)/mobile/state/mobileAppState';
import { RoutineSection } from './components/RoutineSection';
import { RoutineStepItem } from './components/RoutineStepItem';
import { TodaySurveyCard } from './components/TodaySurveyCard';

export function DailyRoutineView() {
  const defs = getStepDefinitions();
  const { todayRoutine, toggleStepCompletion } = useMobileAppState();

  const stepsByGroup = (group: 'AM' | 'PM' | 'SPECIAL') =>
    defs.filter(d => d.group === group);

  const isStepCompleted = (stepId: string) =>
    todayRoutine.steps.find(s => s.stepId === stepId)?.completed ?? false;

  return (
    <div className="px-4 pb-20 pt-2 space-y-4">
      <RoutineSection title="아침 루틴 (AM)">
        {stepsByGroup('AM').map(def => (
          <RoutineStepItem
            key={def.id}
            definition={def}
            completed={isStepCompleted(def.id)}
            onToggle={() => toggleStepCompletion(def.id)}
          />
        ))}
      </RoutineSection>

      <RoutineSection title="저녁 루틴 (PM)">
        {stepsByGroup('PM').map(def => (
          <RoutineStepItem
            key={def.id}
            definition={def}
            completed={isStepCompleted(def.id)}
            onToggle={() => toggleStepCompletion(def.id)}
          />
        ))}
      </RoutineSection>

      <RoutineSection title="스페셜 케어">
        {stepsByGroup('SPECIAL').map(def => (
          <RoutineStepItem
            key={def.id}
            definition={def}
            completed={isStepCompleted(def.id)}
            onToggle={() => toggleStepCompletion(def.id)}
          />
        ))}
      </RoutineSection>

      <TodaySurveyCard />
    </div>
  );
}
