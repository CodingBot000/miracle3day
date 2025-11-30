'use client';

import React from 'react';
import { useMobileAppState } from '@/app/[locale]/(site)/(pages)/mobile/state/mobileAppState';

export function ChallengeFooter() {
  const { challengeSummary } = useMobileAppState();

  const completionPercent = Math.round(
    challengeSummary.teamCompletionRate * 100
  );

  return (
    <button className="mx-4 mb-3 rounded-2xl bg-neutral-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex flex-col">
        <span className="text-[11px] text-emerald-300">
          팀 챌린지 현황
        </span>
        <span className="text-sm font-semibold">
          {challengeSummary.teamName}
        </span>
        <span className="text-[11px] text-neutral-200 mt-0.5">
          내 순위 {challengeSummary.myRank}위 /{' '}
          {challengeSummary.totalMembers}명 · 팀 완료율 {completionPercent}%
        </span>
      </div>
      <span className="text-[11px] font-medium text-neutral-100">
        랭킹 보러가기 →
      </span>
    </button>
  );
}
