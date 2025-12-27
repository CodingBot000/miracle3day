/**
 * 온보딩 완료 화면 (Completion Screen)
 *
 * 온보딩 완료 후 데이터 요약과 저장 상태를 표시
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SkincareOnboardingDTO } from '@/models/skincare-onboarding.dto';

interface CompletionScreenProps {
  data: Partial<SkincareOnboardingDTO>;  // 사용자가 입력한 데이터
  isLoading: boolean;                    // 저장 중 여부
  error?: string | null;                 // 에러 메시지
  locale?: string;                       // 'ko' | 'en'
}

export default function CompletionScreen({
  data,
  isLoading,
  error,
  locale = 'ko',
}: CompletionScreenProps) {
  // 다국어 텍스트
  const text = {
    ko: {
      title: '프로필 완성!',
      subtitle: '당신의 피부를 위한 맞춤 루틴을\n지금 바로 만들어드릴게요',
      summaryTitle: '📊 입력 정보',
      loading: '잠시만 기다려주세요...',
      saving: '데이터를 저장하고 있습니다',
      error: '오류가 발생했습니다',
      retry: '다시 시도',
    },
    en: {
      title: 'Profile Complete!',
      subtitle: "We'll create your personalized routine\nright now",
      summaryTitle: '📊 Your Information',
      loading: 'Please wait a moment...',
      saving: 'Saving your data',
      error: 'An error occurred',
      retry: 'Retry',
    },
  };

  const content = text[locale as keyof typeof text] || text.ko;

  // 데이터 요약 생성
  const generateSummary = () => {
    const summary: string[] = [];

    if (data.age_group) {
      summary.push(`${locale === 'ko' ? '연령' : 'Age'}: ${data.age_group}`);
    }
    if (data.gender) {
      const genderMap = {
        female: locale === 'ko' ? '여성' : 'Female',
        male: locale === 'ko' ? '남성' : 'Male',
        prefer_not_to_say: locale === 'ko' ? '선택 안 함' : 'Prefer not to say',
      };
      summary.push(`${locale === 'ko' ? '성별' : 'Gender'}: ${genderMap[data.gender as keyof typeof genderMap]}`);
    }
    if (data.country_code) {
      summary.push(`${locale === 'ko' ? '국가' : 'Country'}: ${data.country_code}`);
    }
    if (data.skin_type) {
      const skinTypeMap = {
        dry: locale === 'ko' ? '건성' : 'Dry',
        oily: locale === 'ko' ? '지성' : 'Oily',
        combination: locale === 'ko' ? '복합성' : 'Combination',
        sensitive: locale === 'ko' ? '민감성' : 'Sensitive',
      };
      summary.push(`${locale === 'ko' ? '피부 타입' : 'Skin Type'}: ${skinTypeMap[data.skin_type as keyof typeof skinTypeMap]}`);
    }
    if (data.skin_concerns && data.skin_concerns.length > 0) {
      summary.push(`${locale === 'ko' ? '주요 고민' : 'Main Concerns'}: ${data.skin_concerns.slice(0, 3).join(', ')}`);
    }
    if (data.primary_goal) {
      summary.push(`${locale === 'ko' ? '목표' : 'Goal'}: ${data.primary_goal}`);
    }

    return summary;
  };

  const summary = generateSummary();

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen bg-white px-6 py-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 성공 아이콘 */}
      <motion.div
        className="text-8xl mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        ✅
      </motion.div>

      {/* 타이틀 */}
      <motion.h1
        className="text-3xl font-bold text-gray-800 mb-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {content.title}
      </motion.h1>

      {/* 서브타이틀 */}
      <motion.p
        className="text-base text-gray-600 text-center leading-relaxed whitespace-pre-line mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {content.subtitle}
      </motion.p>

      {/* 데이터 요약 */}
      <motion.div
        className="w-full bg-gray-50 rounded-lg p-6 mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{content.summaryTitle}</h3>
        <div className="space-y-2">
          {summary.map((item, index) => (
            <p key={index} className="text-sm text-gray-700">
              • {item}
            </p>
          ))}
        </div>
      </motion.div>

      {/* 로딩 또는 에러 상태 */}
      {isLoading && (
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* 로딩 스피너 */}
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">{content.loading}</p>
          <p className="text-sm text-gray-500 mt-1">{content.saving}</p>
        </motion.div>
      )}

      {/* 에러 메시지 */}
      {error && !isLoading && (
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-red-600 font-medium mb-4">
            {content.error}: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-transform"
          >
            {content.retry}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
