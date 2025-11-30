'use client';

import React from 'react';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex items-center rounded-full bg-neutral-100 p-1 text-xs">
      {options.map(option => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            className={`px-3 py-1 rounded-full transition text-xs ${
              isActive
                ? 'bg-white shadow-sm text-neutral-900'
                : 'text-neutral-500'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
