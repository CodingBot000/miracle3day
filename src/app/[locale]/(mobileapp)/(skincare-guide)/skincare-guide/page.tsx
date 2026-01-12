'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useNavigation } from '@/hooks/useNavigation';
import ConditionCard from '../components/ConditionCard';
import ConditionSelector from '../components/ConditionSelector';
import {
  getConditionFromStorage,
  getConditionFromAPI,
  checkLoginStatus,
  getDefaultCondition,
} from '../lib/getUserCondition';
import { UserCondition } from '../lib/types';

export default function SkincareGuidePage() {
  const params = useParams();
  const { navigate, goBack } = useNavigation();
  const locale = (params?.locale as string) || 'ko';

  const [condition, setCondition] = useState<UserCondition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [hasOnboardingData, setHasOnboardingData] = useState(false);

  // 데이터 로드
  useEffect(() => {
    const loadCondition = async () => {
      setIsLoading(true);

      // 1. Storage에서 확인
      const storageData = getConditionFromStorage();
      if (storageData) {
        setCondition(storageData);
        setHasOnboardingData(true);
        setIsLoading(false);
        return;
      }

      // 2. 로그인 확인 후 API에서 가져오기
      const loginStatus = await checkLoginStatus();
      if (loginStatus.isLoggedIn) {
        const apiData = await getConditionFromAPI();
        if (apiData) {
          setCondition(apiData);
          setHasOnboardingData(true);
          setIsLoading(false);
          return;
        }
      }

      // 3. 기본값 사용
      setCondition(getDefaultCondition());
      setHasOnboardingData(false);
      setIsLoading(false);
    };

    loadCondition();
  }, []);

  // 분석 시작
  const handleAnalyze = () => {
    if (!condition) return;

    // 조건을 쿼리 파라미터로 전달
    const params = new URLSearchParams({
      age: condition.ageGroup,
      skin: condition.skinType,
      concerns: condition.concerns.join(','),
    });

    navigate(`/skincare-guide/result?${params.toString()}`);
  };

  // 조건 변경
  const handleConditionChange = (newCondition: UserCondition) => {
    setCondition(newCondition);
  };

  const texts = {
    ko: {
      title: '맞춤 스킨케어 가이드',
      subtitle: '당신의 피부에 맞는 가이드를 확인하세요',
      analyze: '이 조건으로 분석하기',
      changeCondition: '다른 조건으로 보고 싶다면 →',
      noData: '온보딩 데이터가 없습니다. 기본 조건으로 설정되었습니다.',
      loading: '불러오는 중...',
    },
    en: {
      title: 'Personalized Skincare Guide',
      subtitle: 'Get a guide tailored to your skin',
      analyze: 'Analyze with this condition',
      changeCondition: 'Want different conditions? →',
      noData: 'No onboarding data. Using default conditions.',
      loading: 'Loading...',
    },
  };

  const t = texts[locale === 'ko' ? 'ko' : 'en'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center">
          <button
            onClick={goBack}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500">{t.loading}</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Title */}
            <div className="text-center mb-8">
              <span className="text-4xl mb-3 block">🧴</span>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t.title}
              </h1>
              <p className="text-gray-500">{t.subtitle}</p>
            </div>

            {/* No data warning */}
            {!hasOnboardingData && (
              <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-700">{t.noData}</p>
              </div>
            )}

            {/* Condition Card */}
            {condition && (
              <ConditionCard condition={condition} locale={locale} />
            )}

            {/* Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleAnalyze}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] transition-all"
              >
                {t.analyze}
              </button>

              <button
                onClick={() => setIsSelectorOpen(true)}
                className="w-full py-3 text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                {t.changeCondition}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Condition Selector Modal */}
      {condition && (
        <ConditionSelector
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          currentCondition={condition}
          onConfirm={handleConditionChange}
          locale={locale}
        />
      )}
    </div>
  );
}
