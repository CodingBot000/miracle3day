'use client';

import React, { useState } from 'react';
import {
  FitzpatrickSelector,
  FitzpatrickResult,
} from '../components/fitzpatrick';

export default function FitzpatrickTestPage() {
  const [result, setResult] = useState<FitzpatrickResult | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [locale, setLocale] = useState<'ko' | 'en'>('ko');

  const handleSelect = (selectedResult: FitzpatrickResult) => {
    console.log('Selected:', selectedResult);
    setResult(selectedResult);
  };

  const handleSkip = () => {
    console.log('Skipped');
    setSkipped(true);
  };

  const handleReset = () => {
    setResult(null);
    setSkipped(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '18px',
          }}
        >
          Fitzpatrick Type 테스트
        </h1>

        {/* 언어 토글 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <button
            onClick={() => setLocale('ko')}
            style={{
              padding: '8px 16px',
              background: locale === 'ko' ? '#007AFF' : '#eee',
              color: locale === 'ko' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            한국어
          </button>
          <button
            onClick={() => setLocale('en')}
            style={{
              padding: '8px 16px',
              background: locale === 'en' ? '#007AFF' : '#eee',
              color: locale === 'en' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            English
          </button>
        </div>

        {/* 결과 또는 선택기 */}
        {result ? (
          <div style={{ textAlign: 'center' }}>
            <h2>선택 완료!</h2>
            <div
              style={{
                background: '#f0f7ff',
                padding: '16px',
                borderRadius: '12px',
                marginTop: '16px',
              }}
            >
              <p>
                <strong>Type:</strong> {result.type}
              </p>
              <p>
                <strong>Method:</strong> {result.method}
              </p>
              {result.rgb && (
                <p>
                  <strong>RGB:</strong> ({result.rgb.r}, {result.rgb.g},{' '}
                  {result.rgb.b})
                </p>
              )}
              <p>
                <strong>Timestamp:</strong> {result.timestamp}
              </p>
            </div>
            <button
              onClick={handleReset}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              다시 테스트
            </button>
          </div>
        ) : skipped ? (
          <div style={{ textAlign: 'center' }}>
            <h2>건너뛰기됨</h2>
            <button
              onClick={handleReset}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              다시 테스트
            </button>
          </div>
        ) : (
          <FitzpatrickSelector
            onSelect={handleSelect}
            onSkip={handleSkip}
            locale={locale}
            showSkip={true}
          />
        )}
      </div>

      {/* 개발자 정보 */}
      <div
        style={{
          maxWidth: '400px',
          margin: '20px auto',
          padding: '16px',
          background: '#fff3cd',
          borderRadius: '8px',
          fontSize: '13px',
        }}
      >
        <strong>개발/테스트 페이지</strong>
        <p style={{ marginTop: '8px', color: '#856404' }}>
          이 페이지는 FitzpatrickSelector 컴포넌트 테스트용입니다. 실제
          온보딩에서는 skincare-onboarding 스텝에 통합됩니다.
        </p>
      </div>
    </div>
  );
}
