'use client';

import React from 'react';
import { useMobileAppState } from '@/app/[locale]/(site)/mobile/state/mobileAppState';
import { BottomTabBar } from '@/app/[locale]/(site)/mobile/components/ui/BottomTabBar';
import { RoutineScreen } from '@/app/[locale]/(site)/mobile/screens/Routine/RoutineScreen';
import { PlaceholderScreen } from '@/app/[locale]/(site)/mobile/screens/Placeholder/PlaceholderScreen';
import { SafeAreaContainer } from '@/app/[locale]/(site)/mobile/components/ui/SafeAreaContainer';

export function MobileAppShell() {
  const { activeTab } = useMobileAppState();

  const renderContent = () => {
    switch (activeTab) {
      case 'routine':
        return <RoutineScreen />;
      case 'community':
        return <PlaceholderScreen title="커뮤니티" description="추후 구현 예정인 영역입니다." />;
      case 'my':
        return <PlaceholderScreen title="MY" description="추후 구현 예정인 영역입니다." />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaContainer>
      <div className="flex flex-col h-full">
        {/* 상단 앱 헤더 */}
        <header className="px-4 pt-3 pb-2 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-emerald-600">7DayMiracle · Routine</span>
            <span className="text-base font-semibold">나만의 스킨 루틴 플래너</span>
          </div>
          {/* 오른쪽에 간단한 아이콘 자리 (환경설정 등) */}
          <button className="text-xs text-neutral-500">설정</button>
        </header>

        {/* 메인 컨텐츠 영역 */}
        <main className="flex-1 overflow-y-auto bg-neutral-50">
          {renderContent()}
        </main>

        {/* 하단 탭 바 */}
        <BottomTabBar />
      </div>
    </SafeAreaContainer>
  );
}
