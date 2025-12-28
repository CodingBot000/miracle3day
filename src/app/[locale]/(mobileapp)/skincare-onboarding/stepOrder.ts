/**
 * 온보딩 스텝 순서 정의
 *
 * 순서를 변경하려면 배열 순서만 바꾸면 됩니다.
 * 스텝을 제외하려면 해당 항목을 주석 처리하거나 제거하면 됩니다.
 */
export const ONBOARDING_STEP_ORDER = [
  'fitzpatrick', // 피부톤 (Fitzpatrick Type)
  'age_group', // 연령대
  'gender', // 성별
  'country', // 거주 국가
  'skin_type', // 피부 타입
  'skin_concerns', // 피부 고민
  'current_products', // 현재 사용 제품
  'daily_routine_time', // 루틴 시간
  'primary_goal', // 주요 목표
  'interested_ingredients', // 관심 성분
  'product_preferences', // 제품 선호도
  'sleep_pattern', // 수면 패턴
  'work_environment', // 생활 환경
  'exercise_frequency', // 운동 빈도
  'monthly_budget', // 월 예산
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_ORDER)[number];

/**
 * 스텝 타입 정의
 */
export type OnboardingStepType = 'single_choice' | 'multiple_choice' | 'component';

/**
 * 스텝 인덱스 조회 유틸리티
 */
export function getStepIndex(stepId: OnboardingStepId): number {
  return ONBOARDING_STEP_ORDER.indexOf(stepId);
}

/**
 * 다음 스텝 ID 조회
 */
export function getNextStepId(currentStepId: OnboardingStepId): OnboardingStepId | null {
  const currentIndex = getStepIndex(currentStepId);
  if (currentIndex === -1 || currentIndex >= ONBOARDING_STEP_ORDER.length - 1) {
    return null;
  }
  return ONBOARDING_STEP_ORDER[currentIndex + 1];
}

/**
 * 이전 스텝 ID 조회
 */
export function getPrevStepId(currentStepId: OnboardingStepId): OnboardingStepId | null {
  const currentIndex = getStepIndex(currentStepId);
  if (currentIndex <= 0) {
    return null;
  }
  return ONBOARDING_STEP_ORDER[currentIndex - 1];
}

/**
 * 총 스텝 수
 */
export const TOTAL_STEPS = ONBOARDING_STEP_ORDER.length;
