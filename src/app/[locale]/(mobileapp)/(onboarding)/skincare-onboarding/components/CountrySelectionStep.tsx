/**
 * 국가 선택 전용 단계 컴포넌트
 *
 * NationModal을 사용하여 국가를 선택하는 특별한 단계
 * 기본 QuestionStep 레이아웃을 따르지만 내부 컨텐츠만 NationModal 사용
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NationModal } from '@/components/template/modal/NationModal';
import { CountryCode } from '@/models/country-code.dto';
import { findCountry } from '@/constants/country';
import ProgressBar from './ProgressBar';
import { validateCountryStep } from '../validateStep';

interface CountrySelectionStepProps {
  step: number;                           // 현재 단계 (1-16)
  questionData: {
    title: { ko: string; en: string };
    subtitle?: { ko: string; en: string };
  };
  currentAnswer: string | null;           // 현재 선택된 country_code
  onAnswer: (countryCode: string) => void; // country_code 선택 시 콜백
  onNext: () => void;                      // 다음 버튼 클릭 시
  onBack: () => void;                      // 이전 버튼 클릭 시
  locale?: string;                         // 'ko' | 'en'
}

export default function CountrySelectionStep({
  step,
  questionData,
  currentAnswer,
  onAnswer,
  onNext,
  onBack,
  locale = 'ko',
}: CountrySelectionStepProps) {
  // 선택된 국가 객체
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);

  // 다국어 텍스트
  const lang = locale as 'ko' | 'en';
  const title = questionData.title[lang];
  const subtitle = questionData.subtitle?.[lang];

  // currentAnswer(country_code)로부터 국가 객체 초기화
  useEffect(() => {
    if (currentAnswer) {
      const country = findCountry(currentAnswer);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [currentAnswer]);

  // 국가 선택 처리
  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    // country_code를 답변으로 저장
    onAnswer(country.country_code);
  };

  // 다음 버튼 활성화 여부 (validation 함수 사용)
  const isNextEnabled = validateCountryStep(currentAnswer);

  return (
    <motion.div
      className="flex flex-col h-screen bg-white"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      {/* 진행률 표시 */}
      <ProgressBar current={step} total={16} />

      {/* 질문 헤더 */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>

      {/* 국가 선택 컨텐츠 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* NationModal */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {lang === 'ko' ? '국가 선택' : 'Select Country'}
            </label>
            <NationModal
              nation={selectedCountry?.country_name || ''}
              onSelect={handleCountrySelect}
            />
          </div>

          {/* 선택된 국가 정보 표시 (옵션) */}
          {selectedCountry && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 text-2xl">
                  {selectedCountry.country_code === 'KR' && '🇰🇷'}
                  {selectedCountry.country_code === 'US' && '🇺🇸'}
                  {selectedCountry.country_code === 'JP' && '🇯🇵'}
                  {selectedCountry.country_code === 'CN' && '🇨🇳'}
                  {!['KR', 'US', 'JP', 'CN'].includes(selectedCountry.country_code) && '🌍'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {selectedCountry.country_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {lang === 'ko' ? '국가 코드' : 'Country Code'}: {selectedCountry.country_code}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* 하단 고정 버튼 영역 */}
      <div className="px-6 pb-8 safe-area-bottom border-t border-gray-200 pt-4">
        <div className="flex gap-3">
          {/* 이전 버튼 */}
          <button
            onClick={onBack}
            className="flex-1 bg-white text-gray-700 font-semibold py-3 rounded-lg border-2 border-gray-300 hover:bg-gray-50 active:scale-95 transition-transform"
          >
            {lang === 'ko' ? '이전' : 'Back'}
          </button>

          {/* 다음 버튼 */}
          <button
            onClick={onNext}
            disabled={!isNextEnabled}
            className={`flex-1 font-semibold py-3 rounded-lg transition-all ${
              isNextEnabled
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {lang === 'ko' ? '다음' : 'Next'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
