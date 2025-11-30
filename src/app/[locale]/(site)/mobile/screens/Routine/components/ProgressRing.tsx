'use client';

import React from 'react';

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0~1
}

export function ProgressRing({ size = 64, strokeWidth = 6, progress }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - circumference * Math.min(Math.max(progress, 0), 1);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        stroke="#E5E7EB"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="#34D399"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
}
