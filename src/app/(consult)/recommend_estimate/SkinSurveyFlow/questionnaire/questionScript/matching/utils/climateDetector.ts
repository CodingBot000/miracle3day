import { Hemisphere } from '../constants/countryHemisphere';

/**
 * 반구별 여름철 월 정의 (0-11, JavaScript Date.getMonth() 기준)
 */
const SUMMER_MONTHS: Record<Hemisphere, number[]> = {
  north: [5, 6, 7, 8],        // June-Sep
  south: [11, 0, 1, 2],       // Dec-Mar
  equatorial: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // 연중
};

/**
 * 현재 월이 해당 반구의 여름철인지 확인
 */
export function isSummerMonth(month: number, hemisphere: Hemisphere): boolean {
  return SUMMER_MONTHS[hemisphere].includes(month);
}

/**
 * UV 위험도 레벨 (1-5)
 */
export function getUVRiskLevel(month: number, hemisphere: Hemisphere): 1 | 2 | 3 | 4 | 5 {
  if (hemisphere === 'equatorial') {
    return 5; // 항상 최고 위험도
  }

  if (isSummerMonth(month, hemisphere)) {
    return 5; // 여름: 최고 위험도
  }

  // 봄/가을: 중간 위험도
  const springFall = hemisphere === 'north'
    ? [3, 4, 9, 10]    // Apr, May, Oct, Nov
    : [9, 10, 3, 4];   // Oct, Nov, Apr, May

  if (springFall.includes(month)) {
    return 3;
  }

  // 겨울: 낮은 위험도
  return 1;
}

/**
 * 계절 이름 반환
 */
export function getSeasonName(
  month: number,
  hemisphere: Hemisphere,
  lang: 'ko' | 'en' = 'en'
): string {
  if (hemisphere === 'equatorial') {
    return lang === 'ko' ? '연중 고온' : 'Year-round High UV';
  }

  const isSummer = isSummerMonth(month, hemisphere);

  if (lang === 'ko') {
    return isSummer ? '여름철' : '가을/겨울철';
  }
  return isSummer ? 'Summer' : 'Fall/Winter';
}

/**
 * 시술 적합도 상태 반환
 */
export function getTreatmentSuitability(
  month: number,
  hemisphere: Hemisphere
): 'optimal' | 'caution' | 'high_risk' {
  const uvRisk = getUVRiskLevel(month, hemisphere);

  if (uvRisk <= 2) return 'optimal';
  if (uvRisk <= 3) return 'caution';
  return 'high_risk';
}
