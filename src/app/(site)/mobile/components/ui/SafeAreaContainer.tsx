'use client';

import React, { ReactNode } from 'react';

export function SafeAreaContainer({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {children}
    </div>
  );
}
