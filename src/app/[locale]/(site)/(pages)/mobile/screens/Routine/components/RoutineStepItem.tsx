'use client';

import React from 'react';
import type { RoutineStepDefinition } from '@/app/[locale]/(site)/(pages)/mobile/state/routineTypes';

interface Props {
  definition: RoutineStepDefinition;
  completed: boolean;
  onToggle: () => void;
}

export function RoutineStepItem({ definition, completed, onToggle }: Props) {
  return (
    <button
      className={`w-full flex items-start gap-3 rounded-2xl border px-3.5 py-3 mb-2 text-left transition ${
        completed
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-white border-neutral-100'
      }`}
      onClick={onToggle}
    >
      <div
        className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center text-[10px] font-semibold ${
          completed
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-neutral-300 bg-white text-transparent'
        }`}
      >
        ✓
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-900">
            {definition.title}
          </span>
          <span className="text-[11px] text-neutral-400">
            {definition.frequency === 'daily'
              ? '매일'
              : definition.frequency === 'weekly'
              ? '주 1~2회'
              : '격일'}
          </span>
        </div>
        {definition.description && (
          <p className="text-[11px] text-neutral-500 mt-1">
            {definition.description}
          </p>
        )}
      </div>
    </button>
  );
}
