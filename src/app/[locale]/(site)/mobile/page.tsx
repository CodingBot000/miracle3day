'use client';

import React from 'react';
import { MobileAppStateProvider } from './state/mobileAppState';
import { MobileAppShell } from './app-shell/MobileAppShell';
import { MobileTheme } from './app-shell/MobileTheme';

export default function MobilePage() {
  return (
    <MobileTheme>
      <MobileAppStateProvider>
        <MobileAppShell />
      </MobileAppStateProvider>
    </MobileTheme>
  );
}
