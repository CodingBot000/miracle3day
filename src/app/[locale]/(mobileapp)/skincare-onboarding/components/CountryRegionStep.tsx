/**
 * 국가 및 지역 선택 통합 컴포넌트
 *
 * NationModal로 국가 선택 후, 지역 데이터가 있는 경우 하단에 지역 카드 표시
 * 복잡한 조건부 활성화 로직 구현
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NationModal } from '@/components/template/modal/NationModal';
import { CountryCode } from '@/models/country-code.dto';
import { findCountry } from '@/constants/country';
import ProgressBar from './ProgressBar';
import citiesByRegion from '@/locales/skincare/cities_by_region.json';

interface Region {
  id: string;
  name: {
    native: string;
    en: string;
  };
  icon: string;
  climate: string;
  example_cities: {
    native: string;
    en: string;
  };
}

interface CountryRegionAnswer {
  country_code: string;
  region?: string | null;
}

interface CountryRegionStepProps {
  step: number;                           // 현재 단계 (1-N)
  totalQuestions: number;                 // 전체 질문 개수 (동적)
  questionData: {
    title: { ko: string; en: string };
    subtitle?: { ko: string; en: string };
    subquestion?: {
      title: { ko: string; en: string };
      subtitle?: { ko: string; en: string };
    };
  };
  currentAnswer: CountryRegionAnswer | null;  // { country_code, region }
  onAnswer: (answer: CountryRegionAnswer) => void;
  onNext: () => void;
  onBack: () => void;
  locale?: string;
}

export default function CountryRegionStep({
  step,
  totalQuestions,
  questionData,
  currentAnswer,
  onAnswer,
  onNext,
  onBack,
  locale = 'ko',
}: CountryRegionStepProps) {
  // 선택된 국가 객체
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);

  // 다국어 텍스트
  const lang = locale as 'ko' | 'en';
  const title = questionData.title[lang];
  const subtitle = questionData.subtitle?.[lang];
  const subquestionTitle = questionData.subquestion?.title?.[lang];

  // currentAnswer로부터 국가 객체 초기화
  useEffect(() => {
    if (currentAnswer?.country_code) {
      const country = findCountry(currentAnswer.country_code);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [currentAnswer?.country_code]);

  /**
   * 선택된 국가의 지역 데이터 가져오기
   */
  const selectedCountryRegions: Region[] | null = currentAnswer?.country_code
    ? (citiesByRegion.regions as any)[currentAnswer.country_code]?.regions || null
    : null;

  /**
   * 국가 선택 핸들러
   *
   * 국가 변경 시 항상 region 초기화 (복잡도 최소화)
   */
  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);

    // 답변 업데이트 (항상 region을 null로 초기화)
    onAnswer({
      country_code: country.country_code,
      region: null  // 항상 초기화
    });
  };

  /**
   * 지역 선택 핸들러
   */
  const handleRegionSelect = (regionId: string) => {
    if (!currentAnswer) return;

    onAnswer({
      ...currentAnswer,
      region: regionId
    });
  };

  /**
   * Next 버튼 활성화 여부 (useMemo로 상태 변경 시 즉시 재계산)
   *
   * 조건:
   * 1. 국가 미선택 → 비활성화
   * 2. 국가 선택 + 지역 데이터 없음 → 활성화
   * 3. 국가 선택 + 지역 데이터 있음 + 지역 미선택 → 비활성화
   * 4. 국가 선택 + 지역 데이터 있음 + 지역 선택 → 활성화
   */
  const isNextEnabled = useMemo(() => {
    // 조건 1: 국가 미선택
    if (!currentAnswer?.country_code) {
      return false;
    }

    // 조건 2: 지역 데이터 없음 → 활성화
    if (!selectedCountryRegions || selectedCountryRegions.length === 0) {
      return true;
    }

    // 조건 3, 4: 지역 데이터 있음 → 지역 선택 여부로 판단
    return !!currentAnswer.region;
  }, [currentAnswer, selectedCountryRegions]);

  return (
    <motion.div
      className="flex flex-col h-screen bg-white"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      {/* 진행률 표시 */}
      <ProgressBar current={step} total={totalQuestions} />

      {/* 질문 헤더 */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* 국가 선택 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {lang === 'ko' ? '국가 선택' : 'Select Country'}
            </label>
            <NationModal
              nation={selectedCountry?.country_name || ''}
              onSelect={handleCountrySelect}
            />
          </div>

          {/* 선택된 국가 정보 표시 */}
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
                  {selectedCountry.country_code === 'CA' && '🇨🇦'}
                  {selectedCountry.country_code === 'AU' && '🇦🇺'}
                  {!['KR', 'US', 'JP', 'CN', 'CA', 'AU'].includes(selectedCountry.country_code) && '🌍'}
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

        {/* 지역 선택 (조건부 표시) */}
        <AnimatePresence>
          {selectedCountryRegions && selectedCountryRegions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="region-selection pt-6 border-t border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {subquestionTitle || (lang === 'ko' ? '어느 지역에 거주하시나요?' : 'Which region do you live in?')}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {selectedCountryRegions.map((region) => (
                  <motion.button
                    key={region.id}
                    onClick={() => handleRegionSelect(region.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      region-card flex flex-col items-center gap-2 p-4 rounded-lg border-2
                      transition-all hover:shadow-md
                      ${currentAnswer?.region === region.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                      }
                    `}
                  >
                    <span className="text-3xl mb-1">{region.icon}</span>
                    <h4 className="font-semibold text-gray-900 text-center text-sm">
                      {region.name[lang] || region.name.en}
                    </h4>
                    <p className="text-xs text-gray-500 text-center leading-tight">
                      {region.example_cities[lang] || region.example_cities.en}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 하단 고정 버튼 영역 */}
      <div className="px-6 pb-8 safe-area-bottom border-t border-gray-200 pt-4">
        <div className="flex gap-3">
          {/* 이전 버튼 (항상 활성화) */}
          <button
            onClick={onBack}
            className="flex-1 bg-white text-gray-700 font-semibold py-3 rounded-lg border-2 border-gray-300 hover:bg-gray-50 active:scale-95 transition-transform"
          >
            {lang === 'ko' ? '이전' : 'Back'}
          </button>

          {/* 다음 버튼 (조건부 활성화) */}
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
