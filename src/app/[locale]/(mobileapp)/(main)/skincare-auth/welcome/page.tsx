'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { navigate } = useNavigation();

  // 3초 후 자동 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      handleStart();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    console.log('[DEBUG] Going to main page');
    navigate('/skincare-main', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* 환영 아이콘 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-7xl mb-6"
        >
          {locale === 'ko' ? '    ' : '    '}
        </motion.div>

        {/* 환영 메시지 */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          {locale === 'ko'
            ? '다시 돌아오신걸 환영합니다!'
            : 'Welcome back!'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-700 mb-2"
        >
          {locale === 'ko'
            ? '그사이 피부관리는 잘 하셨는지요?'
            : 'How has your skincare been going?'}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-700 mb-8"
        >
          {locale === 'ko'
            ? '우리함께 피부관리를 다시 시작해요!'
            : "Let's continue your skincare journey together!"}
        </motion.p>

        {/* 시작 버튼 */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleStart}
          className="
            bg-gradient-to-r from-blue-600 to-purple-600
            text-white px-8 py-4 rounded-xl
            font-semibold text-lg
            hover:from-blue-700 hover:to-purple-700
            active:scale-[0.98]
            transition-all shadow-lg
          "
        >
          {locale === 'ko' ? '시작하기' : 'Get Started'}
        </motion.button>

        {/* 자동 이동 안내 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-gray-500 mt-6"
        >
          {locale === 'ko'
            ? '3초 후 자동으로 이동합니다...'
            : 'Redirecting in 3 seconds...'}
        </motion.p>
      </motion.div>
    </div>
  );
}
