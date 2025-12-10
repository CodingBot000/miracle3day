'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import RecommendationResult from '../RecommendationResult';
import { RecommendationOutput } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import { useTranslations } from 'next-intl';
import TreatmentAnalysisLoading from '@/app/[locale]/(consult)/common/analysis_animation/TreatmentAnalysisLoading';
import { MobileAnalysisLoadingScreen } from '@/app/[locale]/(consult)/common/analysis_animation/MobileAnalysisLoadingScreen';

const RESULT_STORAGE_KEY = 'recommendation_result';
const FORM_DATA_STORAGE_KEY = 'recommendation_form_data';
const SUBMISSION_ID_STORAGE_KEY = 'recommendation_submission_id';

export default function RecommendationResultPage() {
  const router = useRouter();
  const t = useTranslations('DataLost');
  const [isLoading, setIsLoading] = useState(true);
  const [showDataLostModal, setShowDataLostModal] = useState(false);
  const [recommendationOutput, setRecommendationOutput] = useState<RecommendationOutput | null>(null);
  const [formData, setFormData] = useState<Record<string, any> | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    // sessionStorage에서 데이터 가져오기
    const storedResult = sessionStorage.getItem(RESULT_STORAGE_KEY);
    const storedFormData = sessionStorage.getItem(FORM_DATA_STORAGE_KEY);
    const storedSubmissionId = sessionStorage.getItem(SUBMISSION_ID_STORAGE_KEY);

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
        setSubmissionId(storedSubmissionId);
        setIsLoading(false);

        // sessionStorage는 브라우저 탭이 닫힐 때까지 유지 (새로고침해도 유지됨)
        // 탭을 닫으면 자동으로 삭제되므로 명시적으로 삭제하지 않음
      }, randomDelay);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Failed to parse recommendation data:', error);
      setIsLoading(false);
      setShowDataLostModal(true);
    }
  }, [router]);

  // 페이지를 벗어날 때 sessionStorage 정리
  useEffect(() => {
    const handleRouteChange = () => {
      sessionStorage.removeItem(RESULT_STORAGE_KEY);
      sessionStorage.removeItem(FORM_DATA_STORAGE_KEY);
    };

    // 브라우저의 뒤로가기/앞으로가기 감지
    window.addEventListener('popstate', handleRouteChange);

    // 탭/창을 닫을 때만 정리 (HMR에서는 실행 안됨)
    const handleBeforeUnload = () => {
      handleRouteChange();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // HMR/개발환경에서 컴포넌트 리마운트 시 데이터 유지를 위해
      // cleanup에서 sessionStorage 삭제하지 않음
    };
  }, []);

  const handleRetryQuestionnaire = () => {
    router.replace('/recommend_estimate');
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 min-h-screen bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0] overflow-hidden">
        <div className="flex flex-col justify-center items-center min-h-screen">
          {/* <DotLottieReact
            src="/lottie/analysis.lottie"
            loop
            autoplay
            style={{ width: 200, height: 200 }}
          /> */}
          {/* <p className="mt-4 text-xl font-medium text-gray-700 justify-center items-center">
            {locale === 'ko'
              ? "맞춤형 시술 계획을 분석 중입니다..."
              : "Analyzing your personalized treatment plan..."}
          </p> */}
          {/* <div className="mt-2 justify-center items-center">
            <TreatmentAnalysisLoading />
            </div> */}
              
                  {/* 모바일 전용 컴포넌트 (md:hidden으로 데스크탑에서 안 보임) */}
                  <MobileAnalysisLoadingScreen />
              
              
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
                {t('title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('description')}
              </p>
            </div>
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={handleRetryQuestionnaire}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-200"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{t('retryButton')}</span>
              </button>
              <button
                onClick={handleGoHome}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span>{t('homeButton')}</span>
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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <RecommendationResult
        output={recommendationOutput}
        formData={formData || undefined}
        submissionId={submissionId || undefined}
        onFindClinics={() => {
          window.open('https://mimotok.com/hospital', '_blank', 'noopener,noreferrer');
        }}
        onConsult={() => {
          window.open('https://mimotok.com/hospital', '_blank', 'noopener,noreferrer');
        }}
      />
    </div>
  );
}
