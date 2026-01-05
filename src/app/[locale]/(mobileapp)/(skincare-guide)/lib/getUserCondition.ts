/**
 * 사용자 조건 가져오기
 * 1. mobileStorage에서 온보딩 데이터 확인
 * 2. 없으면 API에서 가져오기
 */

import { mobileStorage, STORAGE_KEYS } from '@/lib/storage';
import { getOnboarding } from '@/lib/api/skincare-onboarding';
import { UserCondition, OnboardingData } from './types';

// 온보딩 데이터에서 UserCondition 형식으로 변환
function mapOnboardingToCondition(data: OnboardingData): UserCondition {
  // age_group 변환 (예: "age_20s" -> "20s")
  let ageGroup = data.age_group || '20s';
  if (ageGroup.startsWith('age_')) {
    ageGroup = ageGroup.replace('age_', '');
  }

  // 40대와 50대 통합
  if (ageGroup === '40s' || ageGroup === '50s') {
    ageGroup = '40s-50s';
  }
  if (ageGroup === '60s' || ageGroup === '70s' || ageGroup === '60s_above') {
    ageGroup = '60s+';
  }

  return {
    ageGroup,
    skinType: data.skin_type || 'combination',
    concerns: data.skin_concerns || [],
    gender: data.gender,
  };
}

// mobileStorage에서 온보딩 데이터 가져오기
export function getConditionFromStorage(): UserCondition | null {
  try {
    const stored = mobileStorage.getRaw(STORAGE_KEYS.SKINCARE_ONBOARDING_ANSWERS);
    if (stored) {
      const data: OnboardingData = JSON.parse(stored);
      return mapOnboardingToCondition(data);
    }
  } catch (error) {
    console.error('Error reading from storage:', error);
  }
  return null;
}

// API에서 온보딩 데이터 가져오기
export async function getConditionFromAPI(): Promise<UserCondition | null> {
  try {
    // First check login status to get userId
    const loginStatus = await checkLoginStatus();
    if (!loginStatus.isLoggedIn || !loginStatus.userId) {
      return null;
    }

    const data = await getOnboarding(loginStatus.userId);
    if (data) {
      return mapOnboardingToCondition(data as OnboardingData);
    }
  } catch (error) {
    console.error('Error fetching from API:', error);
  }
  return null;
}

// 세션에서 사용자 ID 가져오기
export async function checkLoginStatus(): Promise<{ isLoggedIn: boolean; userId?: string; email?: string }> {
  try {
    const res = await fetch('/api/auth/session', { credentials: 'include' });
    const data = await res.json();
    if (data.auth) {
      return { isLoggedIn: true, userId: data.auth.id, email: data.auth.email };
    }
  } catch (error) {
    console.error('Error checking login status:', error);
  }
  return { isLoggedIn: false };
}

// 기본 조건 (데이터 없을 때)
export function getDefaultCondition(): UserCondition {
  return {
    ageGroup: '20s',
    skinType: 'combination',
    concerns: ['pores', 'oiliness'],
  };
}
