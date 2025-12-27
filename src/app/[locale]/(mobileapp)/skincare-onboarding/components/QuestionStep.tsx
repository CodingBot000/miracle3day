/**
 * 온보딩 질문 단계 공통 컴포넌트
 *
 * 다양한 타입의 질문을 렌더링하는 공통 컴포넌트
 * - single_choice: 단일 선택
 * - multiple_choice: 다중 선택
 * - single_choice_with_search: 검색 가능한 단일 선택
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';
import ProgressBar from './ProgressBar';
import { validateStep } from '../validateStep';

interface QuestionOption {
  id: string;
  label: {
    ko: string;
    en: string;
  };
  description?: {
    ko: string;
    en: string;
  };
  sub_description?: {
    ko: string;
    en: string;
  };
}

interface QuestionStepProps {
  step: number;                           // 현재 단계 (1-N)
  totalQuestions: number;                 // 전체 질문 개수 (동적)
  questionData: {
    id: string;
    type: 'single_choice' | 'multiple_choice' | 'single_choice_with_search';
    title: { ko: string; en: string };
    subtitle?: { ko: string; en: string };
    skip_allowed?: boolean;
    max_selections?: number;
    options?: QuestionOption[];
    search_placeholder?: { ko: string; en: string };
  };
  currentAnswer: string | string[] | null;  // 현재 선택된 답변
  onAnswer: (answer: string | string[]) => void; // 답변 선택 시 콜백
  onNext: () => void;                       // 다음 버튼 클릭 시
  onBack: () => void;                       // 이전 버튼 클릭 시
  locale?: string;                          // 'ko' | 'en'
}

export default function QuestionStep({
  step,
  totalQuestions,
  questionData,
  currentAnswer,
  onAnswer,
  onNext,
  onBack,
  locale = 'ko',
}: QuestionStepProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // 다국어 텍스트
  const lang = locale as 'ko' | 'en';
  const title = questionData.title[lang];
  const subtitle = questionData.subtitle?.[lang];
  const skipButton = questionData.skip_allowed ? (lang === 'ko' ? '건너뛰기' : 'Skip') : null;
  const searchPlaceholder = questionData.search_placeholder?.[lang];

  // 검색 필터링된 옵션
  const filteredOptions = useMemo(() => {
    if (!questionData.options) return [];
    if (!searchTerm || questionData.type !== 'single_choice_with_search') {
      return questionData.options;
    }
    return questionData.options.filter((option) =>
      option.label[lang].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [questionData.options, searchTerm, questionData.type, lang]);

  // 선택 처리
  const handleSelect = (optionId: string) => {
    if (questionData.type === 'multiple_choice') {
      // 다중 선택 처리
      const currentSelections = Array.isArray(currentAnswer) ? currentAnswer : [];
      const isSelected = currentSelections.includes(optionId);

      if (isSelected) {
        // 선택 해제
        onAnswer(currentSelections.filter((id) => id !== optionId));
      } else {
        // 선택 추가 (max_selections 체크)
        const maxSelections = questionData.max_selections || Infinity;
        if (currentSelections.length < maxSelections) {
          onAnswer([...currentSelections, optionId]);
        }
      }
    } else {
      // 단일 선택 처리
      onAnswer(optionId);
    }
  };

  // 선택 여부 확인
  const isSelected = (optionId: string): boolean => {
    if (Array.isArray(currentAnswer)) {
      return currentAnswer.includes(optionId);
    }
    return currentAnswer === optionId;
  };

  // 다음 버튼 활성화 여부 (validation 함수 사용)
  const isNextEnabled = validateStep(questionData, currentAnswer);

  // 선택 카운트 표시 (다중 선택인 경우)
  const getSelectionCount = () => {
    if (questionData.type !== 'multiple_choice') return null;
    const count = Array.isArray(currentAnswer) ? currentAnswer.length : 0;
    const max = questionData.max_selections || '∞';
    return `${count}/${max} ${lang === 'ko' ? '선택됨' : 'selected'}`;
  };

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
        {getSelectionCount() && (
          <p className="text-sm text-blue-600 font-medium mt-2">{getSelectionCount()}</p>
        )}
      </div>

      {/* 검색창 (single_choice_with_search인 경우) */}
      {questionData.type === 'single_choice_with_search' && (
        <div className="px-6 mb-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* 선택지 리스트 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
        <AnimatePresence>
          {filteredOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <ChoiceCard
                title={option.label[lang]}
                subtitle={option.description?.[lang] || option.sub_description?.[lang]}
                selected={isSelected(option.id)}
                mode={questionData.type === 'multiple_choice' ? 'multi' : 'single'}
                onSelect={() => handleSelect(option.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 검색 결과 없음 */}
        {filteredOptions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {lang === 'ko' ? '검색 결과가 없습니다' : 'No results found'}
          </div>
        )}
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

          {/* 다음 버튼 또는 건너뛰기 버튼 */}
          <button
            onClick={onNext}
            disabled={!isNextEnabled}
            className={`flex-1 font-semibold py-3 rounded-lg transition-all ${
              isNextEnabled
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {skipButton && !isNextEnabled ? skipButton : (lang === 'ko' ? '다음' : 'Next')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
