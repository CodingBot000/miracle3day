'use client';

import React from 'react';
import { useMobileAppState } from '../../state/mobileAppState';

const TABS = [
  { key: 'routine', label: '루틴', icon: '✓' },
  { key: 'community', label: '커뮤니티', icon: '💬' },
  { key: 'my', label: 'MY', icon: '👤' },
] as const;

export function BottomTabBar() {
  const { activeTab, setActiveTab } = useMobileAppState();

  return (
    <nav className="border-t border-neutral-200 bg-white h-14 flex items-stretch">
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            className={`flex-1 flex flex-col items-center justify-center text-xs ${
              isActive ? 'text-emerald-600' : 'text-neutral-400'
            }`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <span className="mb-0.5">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
