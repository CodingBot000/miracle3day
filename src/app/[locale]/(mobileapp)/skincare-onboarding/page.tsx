/**
 * 스킨케어 온보딩 메인 페이지
 *
 * 역할:
 * - 온보딩 플로우 전체 관리
 * - 현재 단계(step) 상태 관리
 * - 사용자 응답 데이터 수집
 * - 뒤로가기 버튼 처리
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import WelcomeScreen from './components/WelcomeScreen';
import IntroScreen from './components/IntroScreen';
import QuestionStep from './components/QuestionStep';
import CountryRegionStep from './components/CountryRegionStep';
import CompletionScreen from './components/CompletionScreen';
import { FitzpatrickSelector, FitzpatrickResult } from '../components/fitzpatrick';
import { SkincareOnboardingDTO } from '@/models/skincare-onboarding.dto';
import { saveOnboarding } from '@/lib/api/skincare-onboarding';
import onboardingData from '@/locales/skincare/skincare_onboarding.json';
import { ONBOARDING_STEP_ORDER, TOTAL_STEPS as TOTAL_QUESTIONS } from './stepOrder';

// 단계 정의
// 0: Welcome, 1: Intro, 2-N: Questions (동적), N+1: Completion

export default function SkincareOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'ko';

  // 현재 단계 (0: Welcome, 1: Intro, 2+: Questions, Last: Completion)
  const [step, setStep] = useState(0);

  // 사용자 응답 데이터
  const [answers, setAnswers] = useState<Partial<SkincareOnboardingDTO>>({});

  // 완료 화면 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 전체 질문 개수
  const totalQuestions = TOTAL_QUESTIONS;

  // 전체 단계 수 (Welcome + Intro + Questions + Completion)
  const totalSteps = 2 + totalQuestions;

  // stepOrder에서 stepId로 질문 데이터 가져오기
  const getQuestionData = (stepId: string) => {
    return onboardingData.steps[stepId as keyof typeof onboardingData.steps];
  };

  // 답변 업데이트
  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Fitzpatrick 결과 처리
  const handleFitzpatrickSelect = (result: FitzpatrickResult) => {
    setAnswers((prev) => ({
      ...prev,
      fitzpatrick_type: result.type,
      // RGB가 있으면 사진 선택, 없으면 수동 선택
      fitzpatrick_rgb: result.rgb ? `${result.rgb.r},${result.rgb.g},${result.rgb.b}` : undefined,
    }));
    handleNext();
  };

  // Fitzpatrick 스킵 처리
  const handleFitzpatrickSkip = () => {
    handleNext();
  };

  // 다음 단계로 이동
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  // 이전 단계로 이동
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      // 첫 화면에서 뒤로가기 시 앱 종료 또는 이전 페이지로
      router.back();
    }
  };

  // 온보딩 완료 및 데이터 저장
  const handleComplete = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // TODO: 실제 사용자 UUID 가져오기 (현재는 테스트용 UUID 생성)
      const userId = uuidv4(); // 테스트용: 매번 새로운 UUID 생성

      const submitData: SkincareOnboardingDTO = {
        id_uuid: userId,
        fitzpatrick_type: answers.fitzpatrick_type as number,
        fitzpatrick_rgb: answers.fitzpatrick_rgb as string,
        age_group: answers.age_group as string,
        gender: answers.gender as string,
        country_code: answers.country_code as string,
        region: answers.region as string,
        city: answers.city as string,
        skin_type: answers.skin_type as string,
        skin_concerns: answers.skin_concerns as string[],
        current_products: answers.current_products as string[],
        daily_routine_time: answers.daily_routine_time as string,
        primary_goal: answers.primary_goal as string,
        interested_ingredients: answers.interested_ingredients as string[],
        product_preferences: answers.product_preferences as string[],
        sleep_pattern: answers.sleep_pattern as string,
        work_environment: answers.work_environment as string,
        exercise_frequency: answers.exercise_frequency as string,
        monthly_budget: answers.monthly_budget as string,
        onboarding_completed: true,
        onboarding_step: totalSteps,
      };

      // API 호출하여 데이터 저장
      const result = await saveOnboarding(submitData);

      if (result.success) {
        // 저장 성공 시 메인/대시보드로 이동 (2초 후)
        setTimeout(() => {
          router.push(`/${locale}/skincare/dashboard`);
        }, 2000);
      } else {
        setSubmitError(result.message || 'Failed to save onboarding data');
      }
    } catch (error) {
      console.error('온보딩 저장 실패:', error);
      setSubmitError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 완료 화면 도달 시 자동 저장
  useEffect(() => {
    if (step === totalSteps) {
      handleComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, totalSteps]);

  // 뒤로가기 버튼 처리 (모바일 웹뷰)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      handleBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [step]);

  // 현재 단계에 맞는 컴포넌트 렌더링
  const renderStep = () => {
    // Welcome Screen
    if (step === 0) {
      return <WelcomeScreen onNext={handleNext} locale={locale} />;
    }

    // Intro Screen
    if (step === 1) {
      return <IntroScreen onNext={handleNext} locale={locale} />;
    }

    // Question Steps (2 ~ 1+totalQuestions)
    if (step >= 2 && step < 2 + totalQuestions) {
      const questionIndex = step - 2;
      const stepId = ONBOARDING_STEP_ORDER[questionIndex];
      const questionData = getQuestionData(stepId);

      if (!questionData) {
        console.error(`Question not found for stepId: ${stepId}`);
        return null;
      }

      // 컴포넌트 타입 스텝 처리 (Fitzpatrick)
      if (questionData.type === 'component') {
        if (stepId === 'fitzpatrick') {
          return (
            <div className="min-h-screen bg-white flex flex-col">
              <FitzpatrickSelector
                onSelect={handleFitzpatrickSelect}
                onSkip={handleFitzpatrickSkip}
                locale={locale as 'ko' | 'en'}
                showSkip={questionData.skip_allowed}
              />
            </div>
          );
        }
        // 다른 컴포넌트 타입이 추가될 경우 여기에 처리
        return null;
      }

      // 국가/지역 선택 단계는 특별한 컴포넌트 사용
      if (stepId === 'country') {
        return (
          <CountryRegionStep
            step={questionIndex + 1}
            totalQuestions={totalQuestions}
            questionData={questionData}
            currentAnswer={{
              country_code: answers.country_code as string,
              region: answers.region as string
            }}
            onAnswer={(answer: { country_code: string; region?: string | null }) => {
              setAnswers((prev) => ({
                ...prev,
                country_code: answer.country_code,
                region: answer.region || undefined,
              }));
            }}
            onNext={handleNext}
            onBack={handleBack}
            locale={locale}
          />
        );
      }

      return (
        <QuestionStep
          step={questionIndex + 1}
          totalQuestions={totalQuestions}
          questionData={questionData as any}
          currentAnswer={answers[questionData.id as keyof SkincareOnboardingDTO] as any}
          onAnswer={(answer) => handleAnswer(questionData.id, answer)}
          onNext={handleNext}
          onBack={handleBack}
          locale={locale}
        />
      );
    }

    // Completion Screen
    if (step === totalSteps) {
      return (
        <CompletionScreen
          data={answers}
          isLoading={isSubmitting}
          error={submitError}
          locale={locale}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
