'use client';

import React from 'react';

interface PlaceholderScreenProps {
  title: string;
  description: string;
}

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h2>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}
