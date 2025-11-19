'use client';

import React, { useState } from 'react';
import { useMobileAppState } from '@/app/mobile/state/mobileAppState';

export function TodaySurveyCard() {
  const { todayRoutine, updateTodaySurvey } = useMobileAppState();
  const [noteDraft, setNoteDraft] = useState(todayRoutine.note ?? '');

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    updateTodaySurvey({ skinTightnessScore: value });
  };

  const handleBlur = () => {
    updateTodaySurvey({ note: noteDraft.trim() || undefined });
  };

  return (
    <div className="mt-4 rounded-2xl border border-neutral-100 bg-white px-4 py-3">
      <h3 className="text-sm font-semibold text-neutral-900">
        오늘 피부 상태, 간단 체크하기 (1분)
      </h3>
      <p className="text-[11px] text-neutral-500 mt-0.5">
        오늘 기록은 월간 분석과 배지 획득에 반영돼요.
      </p>

      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-neutral-700">
            오늘 피부 당김 정도 (0~10)
          </span>
          <span className="text-[11px] font-semibold text-emerald-600">
            {todayRoutine.skinTightnessScore ?? 0}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={todayRoutine.skinTightnessScore ?? 0}
          onChange={handleSliderChange}
          className="w-full accent-emerald-500"
        />
      </div>

      <div className="mt-3">
        <label className="text-[11px] text-neutral-700 mb-1 block">
          오늘 특히 신경 쓰였던 점을 한 줄로 적어볼까요?
        </label>
        <textarea
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 resize-none"
          rows={2}
          value={noteDraft}
          onChange={e => setNoteDraft(e.target.value)}
          onBlur={handleBlur}
          placeholder="예: 오후에 턱 주변이 자꾸 간지럽고 건조했어요."
        />
      </div>
    </div>
  );
}
