/**
 * 온보딩 참여 유도 화면 (Intro Screen)
 *
 * 질문 시작 전 사용자에게 온보딩 과정을 설명하는 화면
 * 로그인 필수 체크 후 진행
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '@/hooks/useNavigation';
import ProgressBar from './ProgressBar';
import DevDebugPanel from './DevDebugPanel';

interface IntroScreenProps {
  onNext: () => void;  // 시작 버튼 클릭 시 호출될 콜백
  locale?: string;     // 'ko' | 'en'
}

export default function IntroScreen({ onNext, locale = 'ko' }: IntroScreenProps) {
  const { navigate } = useNavigation();
  const [isChecking, setIsChecking] = useState(false);

  // 로그인 체크 후 진행
  const handleStart = async () => {
    setIsChecking(true);
    console.log('[DEBUG] Checking login status...');

    try {
      // 1. 로그인 상태 확인
      const authResponse = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      const authResult = await authResponse.json();

      if (!authResult.auth) {
        // 미로그인 -> 로그인 페이지로
        console.log('[DEBUG] Not logged in, redirecting to login');
        navigate('/skincare-auth/login', { replace: true });
        return;
      }

      console.log('[DEBUG] Logged in as:', authResult.auth.id);

      // 2. 온보딩 체크
      const onboardingResponse = await fetch('/api/skincare/onboarding/check', {
        credentials: 'include',
      });
      const onboardingResult = await onboardingResponse.json();

      if (onboardingResult.hasOnboarding) {
        // 온보딩 완료 -> 메인 페이지로
        console.log('[DEBUG] Onboarding completed, go to main');
        navigate('/skincare-main', { replace: true });
      } else {
        // 온보딩 미완료 -> 온보딩 시작
        console.log('[DEBUG] Start onboarding');
        onNext();
      }
    } catch (error) {
      console.error('[DEBUG] Error:', error);
      // 에러 시에도 온보딩 시작 (오프라인 모드 지원)
      onNext();
    } finally {
      setIsChecking(false);
    }
  };
  // 다국어 텍스트
  const text = {
    ko: {
      title: '당신의 스킨 루틴을 설정하기 위해\n당신에 대해 알아야 할 것이 있어요',
      subtitle: '짧은 질문이니 조금만 도와주세요\n금방 끝날 거예요! ⏱️',
      button: '시작하기',
    },
    en: {
      title: 'To set up your skin routine,\nwe need to know more about you',
      subtitle: "It's just a few questions!\nWon't take long! ⏱️",
      button: 'Start Journey',
    },
  };

  const content = text[locale as keyof typeof text] || text.ko;

  return (
    <motion.div
      className="flex flex-col h-screen bg-white"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      {/* [DEV] 디버그 패널 - 개발환경에서만 표시 */}
      
        <DevDebugPanel />
      
      {/* 진행률 표시 */}
      <ProgressBar current={0} total={16} />

      {/* 중앙 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* 타이틀 */}
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed whitespace-pre-line"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {content.title}
        </motion.h2>

        {/* 서브타이틀 */}
        <motion.p
          className="text-lg text-gray-600 leading-relaxed whitespace-pre-line"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {content.subtitle}
        </motion.p>

        {/* 일러스트 또는 아이콘 (옵션) */}
        <motion.div
          className="mt-12 text-6xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
        >
          ✨
        </motion.div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="px-6 pb-8 safe-area-bottom">
        <motion.button
          onClick={handleStart}
          disabled={isChecking}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileTap={{ scale: 0.98 }}
        >
          {isChecking
            ? (locale === 'ko' ? '확인 중...' : 'Checking...')
            : content.button
          }
        </motion.button>
      </div>
    </motion.div>
  );
}
