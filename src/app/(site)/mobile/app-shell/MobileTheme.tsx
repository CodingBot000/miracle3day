'use client';

import React, { ReactNode } from 'react';

export function MobileTheme({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex justify-center">
      <div className="w-full max-w-[480px] mx-auto bg-white shadow-sm min-h-screen">
        {children}
      </div>
    </div>
  );
}
