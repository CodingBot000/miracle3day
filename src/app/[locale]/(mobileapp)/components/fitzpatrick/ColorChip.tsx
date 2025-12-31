'use client';

import React from 'react';
import type { ColorChipProps } from './fitzpatrick.types';

export default function ColorChip({
  chip,
  selected,
  onClick,
  locale,
}: ColorChipProps) {
  return (
    <button
      type="button"
      className={`color-chip ${selected ? 'color-chip-selected' : ''}`}
      onClick={onClick}
      aria-label={`${chip.label[locale]} - Type ${chip.type} - ${chip.description[locale]}`}
      aria-pressed={selected}
    >
      <div
        className="color-chip-swatch"
        style={{ backgroundColor: chip.color }}
      />
      <span className="color-chip-label">{chip.label[locale]}</span>
      <span className="color-chip-type">Type {chip.type}</span>
    </button>
  );
}
