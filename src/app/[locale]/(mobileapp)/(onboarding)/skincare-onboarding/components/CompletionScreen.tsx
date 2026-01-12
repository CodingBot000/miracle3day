/**
 * 온보딩 완료 화면 (Completion Screen)
 *
 * 온보딩 완료 후 데이터 요약과 저장 상태를 표시
 * 사용자가 확인 후 AI 분석 화면으로 이동
 */

'use client';

import React, { useState } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
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
  const { navigate } = useNavigation();
  const [isNavigating, setIsNavigating] = useState(false);

  // 다국어 텍스트
  const text = {
    ko: {
      title: '프로필 완성!',
      subtitle: '당신의 피부를 위한 맞춤 루틴을\n지금 바로 만들어드릴게요',
      summaryTitle: '입력 정보',
      loading: '잠시만 기다려주세요...',
      saving: '데이터를 저장하고 있습니다',
      error: '오류가 발생했습니다',
      retry: '다시 시도',
      continueButton: '맞춤 루틴 만들기',
      navigating: 'AI가 분석 중입니다...',
    },
    en: {
      title: 'Profile Complete!',
      subtitle: "We'll create your personalized routine\nright now",
      summaryTitle: 'Your Information',
      loading: 'Please wait a moment...',
      saving: 'Saving your data',
      error: 'An error occurred',
      retry: 'Retry',
      continueButton: 'Create My Routine',
      navigating: 'AI is analyzing...',
    },
  };

  const content = text[locale as keyof typeof text] || text.ko;

  // 데이터 요약 생성 (Enhanced version from guide)
  const generateSummary = (answers: Partial<SkincareOnboardingDTO>) => {
    const summary: Array<{ label: string; value: string }> = [];

    // Step 1: Basic Information
    if (answers.age_group) {
      summary.push({
        label: 'Age Group',
        value: answers.age_group
      });
    }

    if (answers.gender) {
      summary.push({
        label: 'Gender',
        value: answers.gender
      });
    }

    // Step 2: Location (Climate)
    if (answers.country_code) {
      const locationParts = [];
      if (answers.city) locationParts.push(answers.city);
      if (answers.region) locationParts.push(answers.region);
      locationParts.push(answers.country_code);

      summary.push({
        label: 'Location',
        value: locationParts.join(', ')
      });
    }

    // Step 3: Skin Type & Concerns
    if (answers.skin_type) {
      summary.push({
        label: 'Skin Type',
        value: answers.skin_type
      });
    }

    if (answers.skin_concerns && answers.skin_concerns.length > 0) {
      summary.push({
        label: 'Skin Concerns',
        value: answers.skin_concerns.join(', ')
      });
    }

    // Step 4: Fitzpatrick Type
    if (answers.fitzpatrick_type) {
      const fitzpatrickLabels = ['Fair', 'Light', 'Medium', 'Tan', 'Brown', 'Deep'];
      summary.push({
        label: 'Sun Sensitivity',
        value: `Type ${answers.fitzpatrick_type} (${fitzpatrickLabels[answers.fitzpatrick_type - 1]})`
      });
    }

    // Step 5: Current Routine
    if (answers.current_products && answers.current_products.length > 0) {
      summary.push({
        label: 'Current Products',
        value: answers.current_products.join(', ')
      });
    }

    if (answers.daily_routine_time) {
      summary.push({
        label: 'Daily Routine Time',
        value: answers.daily_routine_time
      });
    }

    // Step 6: Goals & Preferences
    if (answers.primary_goal) {
      summary.push({
        label: 'Primary Goal',
        value: answers.primary_goal
      });
    }

    if (answers.interested_ingredients && answers.interested_ingredients.length > 0) {
      summary.push({
        label: 'Interested Ingredients',
        value: answers.interested_ingredients.join(', ')
      });
    }

    if (answers.product_preferences && answers.product_preferences.length > 0) {
      summary.push({
        label: 'Product Preferences',
        value: answers.product_preferences.join(', ')
      });
    }

    // Step 7: Lifestyle
    if (answers.sleep_pattern) {
      summary.push({
        label: 'Sleep Pattern',
        value: answers.sleep_pattern
      });
    }

    if (answers.work_environment) {
      summary.push({
        label: 'Work Environment',
        value: answers.work_environment
      });
    }

    if (answers.exercise_frequency) {
      summary.push({
        label: 'Exercise Frequency',
        value: answers.exercise_frequency
      });
    }

    // Step 8: Budget
    if (answers.monthly_budget) {
      summary.push({
        label: 'Monthly Budget',
        value: answers.monthly_budget
      });
    }

    return summary;
  };

  // Handle navigation to analyzing page
  const handleComplete = async () => {
    setIsNavigating(true);

    try {
      // localStorage는 이미 page.tsx에서 저장됨 (id_uuid_member 포함)
      // 여기서는 덮어쓰지 않음 - 기존 데이터(id_uuid_member 포함) 유지

      // Navigate to AI analysis animation page
      navigate('/skincare-onboarding/analyzing');

    } catch (err) {
      console.error('Error navigating to analyzing:', err);
      setIsNavigating(false);
    }
  };

  const summary = generateSummary(data);

  return (
    <motion.div
      className="flex flex-col items-center min-h-screen h-screen overflow-y-auto bg-white px-6 py-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Success Icon */}
      <motion.div
        className="text-8xl mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        {isLoading ? '...' : ''}
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-3xl font-bold text-gray-800 mb-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {content.title}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-base text-gray-600 text-center leading-relaxed whitespace-pre-line mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {content.subtitle}
      </motion.p>

      {/* Data Summary - Enhanced */}
      <motion.div
        className="w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          {/* <span className="text-xl">📊</span> */}
          {content.summaryTitle}
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {summary.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex justify-between items-start py-2 border-b border-gray-200 last:border-0"
            >
              <span className="text-sm text-gray-500 font-medium">{item.label}</span>
              <span className="text-sm text-gray-800 font-semibold text-right max-w-[60%]">
                {item.value}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">{content.loading}</p>
          <p className="text-sm text-gray-500 mt-1">{content.saving}</p>
        </motion.div>
      )}

      {/* Error Message */}
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

      {/* Continue Button - Navigate to Analyzing */}
      {!isLoading && !error && (
        <motion.div
          className="w-full mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={handleComplete}
            disabled={isNavigating}
            className={`
              w-full py-4 rounded-xl font-bold text-lg text-white
              transition-all duration-300
              ${isNavigating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-[0.98]'
              }
            `}
          >
            {isNavigating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {content.navigating}
              </span>
            ) : (
              content.continueButton
            )}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
