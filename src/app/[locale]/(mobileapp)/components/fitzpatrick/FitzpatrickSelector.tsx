'use client';

import React, { useState } from 'react';
import type {
  FitzpatrickSelectorProps,
  FitzpatrickResult,
} from './fitzpatrick.types';
import { FITZPATRICK_TEXTS } from './fitzpatrick.constants';
import PhotoMethod from './PhotoMethod';
import ManualMethod from './ManualMethod';
import './fitzpatrick.styles.css';

type MethodType = 'photo' | 'manual' | null;

/**
 * Fitzpatrick 피부톤 선택 메인 컴포넌트
 *
 * 사용 예시:
 * ```tsx
 * // 온보딩에서 사용
 * <FitzpatrickSelector
 *   onSelect={(result) => saveToOnboarding(result)}
 *   onSkip={() => goToNextStep()}
 *   locale="ko"
 *   showSkip={true}
 * />
 *
 * // 마이페이지에서 사용 (임베디드)
 * <FitzpatrickSelector
 *   onSelect={(result) => updateProfile(result)}
 *   initialValue={3}
 *   locale="ko"
 *   embedded={true}
 * />
 * ```
 */
export default function FitzpatrickSelector({
  onSelect,
  onSkip,
  initialValue,
  locale,
  showSkip = true,
  embedded = false,
  className = '',
}: FitzpatrickSelectorProps) {
  const [method, setMethod] = useState<MethodType>(null);
  const texts = FITZPATRICK_TEXTS;

  // 선택 완료 핸들러
  const handleSelect = (result: FitzpatrickResult) => {
    onSelect(result);
  };

  // 방법 선택 화면
  const renderMethodSelection = () => (
    <div className="fitzpatrick-method-selection">
      {/* 타이틀 (임베디드 모드가 아닐 때만) */}
      {!embedded && (
        <div className="fitzpatrick-header">
          <h2 className="fitzpatrick-title">{texts.title[locale]}</h2>
          <p className="fitzpatrick-subtitle">{texts.subtitle[locale]}</p>
        </div>
      )}

      {/* 방법 1: 사진으로 확인 */}
      <button
        type="button"
        className="fitzpatrick-method-button fitzpatrick-method-photo"
        onClick={() => setMethod('photo')}
      >
        <span className="fitzpatrick-method-label">
          {texts.photoMethod.label[locale]}
        </span>
        <span className="fitzpatrick-method-description">
          {texts.photoMethod.description[locale]}
        </span>
      </button>

      {/* 구분선 */}
      <div className="fitzpatrick-divider">
        <span>{locale === 'ko' ? '또는' : 'or'}</span>
      </div>

      {/* 방법 2: 직접 선택 */}
      <button
        type="button"
        className="fitzpatrick-method-button fitzpatrick-method-manual"
        onClick={() => setMethod('manual')}
      >
        <span className="fitzpatrick-method-label">
          {texts.manualMethod.label[locale]}
        </span>
      </button>

      {/* 건너뛰기 버튼 */}
      {showSkip && onSkip && (
        <button
          type="button"
          className="fitzpatrick-skip-button"
          onClick={onSkip}
        >
          {texts.skip[locale]}
        </button>
      )}
    </div>
  );

  return (
    <div className={`fitzpatrick-selector ${className}`}>
      {method === null && renderMethodSelection()}

      {method === 'photo' && (
        <PhotoMethod
          onSelect={handleSelect}
          onBack={() => setMethod(null)}
          locale={locale}
        />
      )}

      {method === 'manual' && (
        <ManualMethod
          onSelect={handleSelect}
          onBack={() => setMethod(null)}
          initialValue={initialValue}
          locale={locale}
        />
      )}
    </div>
  );
}
