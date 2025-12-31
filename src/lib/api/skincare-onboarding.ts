/**
 * 스킨케어 온보딩 API 호출 함수
 */

import { SkincareOnboardingDTO, OnboardingApiResponse } from '@/models/skincare-onboarding.dto';

/**
 * 온보딩 데이터를 DB에 저장
 *
 * @param data - 온보딩 응답 데이터
 * @returns API 응답
 */
export async function saveOnboarding(
  data: SkincareOnboardingDTO
): Promise<OnboardingApiResponse> {
  try {
    const response = await fetch('/api/skincare/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('온보딩 저장 실패:', error);
    throw error;
  }
}

/**
 * 기존 온보딩 데이터 조회 (이어하기 기능)
 *
 * @param userId - 사용자 UUID
 * @returns 저장된 온보딩 데이터
 */
export async function getOnboarding(
  userId: string
): Promise<SkincareOnboardingDTO | null> {
  try {
    const response = await fetch(`/api/skincare/onboarding/${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // 데이터 없음
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('온보딩 조회 실패:', error);
    return null;
  }
}

/**
 * 온보딩 진행 상태 업데이트 (중간 저장)
 *
 * @param userId - 사용자 UUID
 * @param step - 현재 단계
 * @param data - 부분 온보딩 데이터
 * @returns API 응답
 */
export async function updateOnboardingProgress(
  userId: string,
  step: number,
  data: Partial<SkincareOnboardingDTO>
): Promise<OnboardingApiResponse> {
  try {
    const response = await fetch('/api/skincare/onboarding/progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_uuid: userId,
        onboarding_step: step,
        ...data,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('온보딩 진행 상태 업데이트 실패:', error);
    throw error;
  }
}
