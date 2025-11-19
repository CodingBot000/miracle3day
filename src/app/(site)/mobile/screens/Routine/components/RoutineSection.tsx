'use client';

import React, { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function RoutineSection({ title, subtitle, children }: Props) {
  return (
    <section>
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        {subtitle && (
          <p className="text-[11px] text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}
