'use client';

import React, { useState } from 'react';
import type {
  ManualMethodProps,
  FitzpatrickResult,
  FitzpatrickType,
} from './fitzpatrick.types';
import {
  FITZPATRICK_COLOR_CHIPS,
  FITZPATRICK_TEXTS,
} from './fitzpatrick.constants';
import ColorChip from './ColorChip';

export default function ManualMethod({
  onSelect,
  onBack,
  initialValue,
  locale,
}: ManualMethodProps) {
  const [selected, setSelected] = useState<FitzpatrickType | null>(
    initialValue || null
  );
  const texts = FITZPATRICK_TEXTS;

  const handleChipClick = (type: FitzpatrickType) => {
    setSelected(type);
  };

  const handleConfirm = () => {
    if (selected === null) return;

    const result: FitzpatrickResult = {
      type: selected,
      method: 'manual',
      timestamp: new Date().toISOString(),
    };

    onSelect(result);
  };

  return (
    <div className="manual-method">
      <h3 className="manual-title">
        {locale === 'ko' ? '피부 톤을 선택하세요' : 'Select your skin tone'}
      </h3>

      <div className="manual-chips-grid">
        {FITZPATRICK_COLOR_CHIPS.map((chip) => (
          <ColorChip
            key={chip.type}
            chip={chip}
            selected={selected === chip.type}
            onClick={() => handleChipClick(chip.type)}
            locale={locale}
          />
        ))}
      </div>

      <p className="manual-tip">
        {locale === 'ko'
          ? '햇볕에 쉽게 타는 편이라면 Fair/Light, 잘 태닝되는 편이라면 Tan/Brown/Deep'
          : 'If you burn easily: Fair/Light. If you tan easily: Tan/Brown/Deep'}
      </p>

      <div className="manual-buttons">
        <button
          type="button"
          className="manual-confirm-button"
          onClick={handleConfirm}
          disabled={selected === null}
        >
          {texts.confirm[locale]}
        </button>

        {onBack && (
          <button
            type="button"
            className="manual-back-button"
            onClick={onBack}
          >
            {locale === 'ko' ? '📷 사진으로 확인하기' : '📷 Use photo instead'}
          </button>
        )}
      </div>
    </div>
  );
}
