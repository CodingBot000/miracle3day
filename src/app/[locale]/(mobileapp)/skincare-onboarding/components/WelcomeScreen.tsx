/**
 * 온보딩 시작 화면 (Welcome Screen)
 *
 * 사용자를 환영하고 온보딩 시작을 유도하는 첫 화면
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onNext: () => void;  // 시작 버튼 클릭 시 호출될 콜백
  locale?: string;     // 'ko' | 'en'
}

export default function WelcomeScreen({ onNext, locale = 'ko' }: WelcomeScreenProps) {
  // 다국어 텍스트
  const text = {
    ko: {
      icon: '🌿',
      title: 'SkinCare Routine Service',
      subtitle: '당신만을 위한 맞춤형 스킨케어 루틴을\nAI가 추천해드립니다',
      button: '시작하기',
    },
    en: {
      icon: '🌿',
      title: 'SkinCare Routine Service',
      subtitle: 'Get personalized skincare routine\nrecommendations powered by AI',
      button: 'Start',
    },
  };

  const content = text[locale as keyof typeof text] || text.ko;

  return (
    <motion.div
      className="flex flex-col items-center justify-between h-screen bg-white px-6 py-8 safe-area"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 중앙 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* 아이콘 */}
        <motion.div
          className="text-8xl mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {content.icon}
        </motion.div>

        {/* 타이틀 */}
        <motion.h1
          className="text-2xl font-bold text-gray-800 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {content.title}
        </motion.h1>

        {/* 서브타이틀 */}
        <motion.p
          className="text-base text-gray-600 leading-relaxed whitespace-pre-line"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {content.subtitle}
        </motion.p>
      </div>

      {/* 하단 고정 버튼 */}
      <motion.button
        onClick={onNext}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow active:scale-95"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        whileTap={{ scale: 0.98 }}
      >
        {content.button}
      </motion.button>
    </motion.div>
  );
}
