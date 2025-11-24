'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import RecommendationResult from '../RecommendationResult';
import { RecommendationOutput } from '@/app/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';

const RESULT_STORAGE_KEY = 'recommendation_result';
const FORM_DATA_STORAGE_KEY = 'recommendation_form_data';

export default function RecommendationResultPage() {
  const router = useRouter();
  const { language } = useCookieLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [showDataLostModal, setShowDataLostModal] = useState(false);
  const [recommendationOutput, setRecommendationOutput] = useState<RecommendationOutput | null>(null);
  const [formData, setFormData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    // sessionStorage에서 데이터 가져오기
    const storedResult = sessionStorage.getItem(RESULT_STORAGE_KEY);
    const storedFormData = sessionStorage.getItem(FORM_DATA_STORAGE_KEY);

    if (!storedResult) {
      // 데이터가 없으면 모달 표시
      setIsLoading(false);
      setShowDataLostModal(true);
      return;
    }

    try {
      const parsedResult = JSON.parse(storedResult) as RecommendationOutput;
      const parsedFormData = storedFormData ? JSON.parse(storedFormData) : null;

      // 2.5초~4초 사이 랜덤 로딩 후 결과 표시
      const randomDelay = Math.floor(Math.random() * (4000 - 2500 + 1)) + 2500;
      const timer = setTimeout(() => {
        setRecommendationOutput(parsedResult);
        setFormData(parsedFormData);
        setIsLoading(false);

        // 사용 후 sessionStorage 정리
        sessionStorage.removeItem(RESULT_STORAGE_KEY);
        sessionStorage.removeItem(FORM_DATA_STORAGE_KEY);
      }, randomDelay);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Failed to parse recommendation data:', error);
      setIsLoading(false);
      setShowDataLostModal(true);
    }
  }, [router]);

  const handleRetryQuestionnaire = () => {
    router.replace('/recommend_estimate');
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
        <div className="flex flex-col justify-center items-center min-h-screen">
          <DotLottieReact
            src="/lottie/analysis.lottie"
            loop
            autoplay
            style={{ width: 200, height: 200 }}
          />
          <p className="mt-4 text-xl font-medium text-gray-700">
            {language === 'ko'
              ? "맞춤형 시술 계획을 분석 중입니다..."
              : "Analyzing your personalized treatment plan..."}
          </p>
        </div>
      </div>
    );
  }

  // 데이터 소실 모달
  if (showDataLostModal) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-md [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'ko' ? '데이터가 소실되었습니다' : 'Data has been lost'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'ko'
                  ? '다시 문진을 작성하시기 바랍니다.'
                  : 'Please fill out the questionnaire again.'}
              </p>
            </div>
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={handleRetryQuestionnaire}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-200"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{language === 'ko' ? '다시 문진 작성하기' : 'Fill out questionnaire again'}</span>
              </button>
              <button
                onClick={handleGoHome}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span>{language === 'ko' ? '홈으로 돌아가기' : 'Go to Home'}</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 결과가 없으면 null
  if (!recommendationOutput) {
    return null;
  }

  // 결과 화면
  return (
    <div className="min-h-screen bg-white">
      <RecommendationResult
        output={recommendationOutput}
        formData={formData || undefined}
        onFindClinics={() => {
          window.open('https://www.mimotok.cloud/hospital', '_blank', 'noopener,noreferrer');
        }}
        onConsult={() => {
          window.open('https://www.mimotok.cloud/hospital', '_blank', 'noopener,noreferrer');
        }}
      />
    </div>
  );
}
