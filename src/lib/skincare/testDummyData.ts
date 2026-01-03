/**
 * 온보딩 테스트용 더미 데이터
 *
 * !! 테스트 전용 - 프로덕션에서 사용 금지 !!
 *
 * 이 데이터는 온보딩 테스트 시 빠른 점프를 위해 사용됩니다.
 * 실제 사용자 데이터와 구분하기 위해 특별한 마커가 포함되어 있습니다.
 */

import { SkincareOnboardingDTO } from '@/models/skincare-onboarding.dto';

// 테스트 데이터 식별 마커
export const TEST_DATA_MARKER = '__TEST_DUMMY__';

/**
 * 테스트용 더미 온보딩 데이터
 * - 모든 필드가 테스트용임을 나타내기 위해 특정 패턴 사용
 * - country_code에 'TEST'가 포함됨
 */
export const TEST_DUMMY_ONBOARDING_DATA: Omit<SkincareOnboardingDTO, 'id_uuid' | 'onboarding_completed' | 'onboarding_step'> = {
  // Fitzpatrick Type (피부톤)
  fitzpatrick_type: 3,
  fitzpatrick_rgb: '210,180,140', // 중간 톤

  // 기본 정보
  age_group: '25-34',
  gender: 'female',

  // 위치 (테스트 마커 포함)
  country_code: 'KR', // 한국
  region: 'Seoul',
  city: `Seoul_${TEST_DATA_MARKER}`, // 테스트 식별용

  // 피부 정보
  skin_type: 'combination',
  skin_concerns: ['acne', 'pores', 'dullness'],

  // 현재 루틴
  current_products: ['cleanser', 'toner', 'moisturizer'],
  daily_routine_time: '5-10min',

  // 목표 및 선호도
  primary_goal: 'anti_aging',
  interested_ingredients: ['retinol', 'vitamin_c', 'niacinamide'],
  product_preferences: ['fragrance_free', 'cruelty_free'],

  // 라이프스타일
  sleep_pattern: '6-7hours',
  work_environment: 'office',
  exercise_frequency: '2-3times',

  // 예산
  monthly_budget: '50000-100000',
};

/**
 * 테스트 데이터인지 확인
 */
export function isTestData(data: Partial<SkincareOnboardingDTO>): boolean {
  return data.city?.includes(TEST_DATA_MARKER) ?? false;
}

/**
 * 특정 스텝까지의 더미 데이터만 반환
 * @param upToStepIndex 해당 인덱스까지의 데이터만 포함 (0-indexed)
 */
export function getPartialTestData(upToStepIndex: number): Partial<SkincareOnboardingDTO> {
  const stepFields: (keyof typeof TEST_DUMMY_ONBOARDING_DATA)[][] = [
    ['fitzpatrick_type', 'fitzpatrick_rgb'], // 0: fitzpatrick
    ['age_group'], // 1: age_group
    ['gender'], // 2: gender
    ['country_code', 'region', 'city'], // 3: country
    ['skin_type'], // 4: skin_type
    ['skin_concerns'], // 5: skin_concerns
    ['current_products'], // 6: current_products
    ['daily_routine_time'], // 7: daily_routine_time
    ['primary_goal'], // 8: primary_goal
    ['interested_ingredients'], // 9: interested_ingredients
    ['product_preferences'], // 10: product_preferences
    ['sleep_pattern'], // 11: sleep_pattern
    ['work_environment'], // 12: work_environment
    ['exercise_frequency'], // 13: exercise_frequency
    ['monthly_budget'], // 14: monthly_budget
  ];

  const result: Partial<SkincareOnboardingDTO> = {};

  for (let i = 0; i <= upToStepIndex && i < stepFields.length; i++) {
    for (const field of stepFields[i]) {
      (result as any)[field] = TEST_DUMMY_ONBOARDING_DATA[field];
    }
  }

  return result;
}

/**
 * 마지막 질문 전까지의 모든 더미 데이터 반환
 * (monthly_budget 제외 - 마지막 질문은 사용자가 직접 선택)
 */
export function getTestDataBeforeLastStep(): Partial<SkincareOnboardingDTO> {
  return getPartialTestData(13); // exercise_frequency까지 (14번째 = index 13)
}
