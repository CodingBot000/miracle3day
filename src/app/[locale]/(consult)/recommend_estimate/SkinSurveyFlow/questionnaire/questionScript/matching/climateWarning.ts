import { getHemisphere } from './constants/countryHemisphere';
import { isUVSensitiveTreatment } from './constants/uvSensitiveTreatments';
import { isSummerMonth, getUVRiskLevel, getSeasonName } from './utils/climateDetector';
import { TreatmentKey, RecommendedItem, ClimateWarning } from './types';
import { META } from './constants/treatmentMeta';

// Re-export ClimateWarning from types for external use
export type { ClimateWarning } from './types';

/**
 * 시술에 대한 기후 경고 생성
 */
export function generateClimateWarning(
  treatmentKey: TreatmentKey,
  userCountryCode: string,
  currentMonth?: number
): ClimateWarning | null {
  // 시술 메타데이터 가져오기
  const meta = META[treatmentKey];
  if (!meta) return null;

  // 1. UV-sensitive 시술인지 확인
  if (!isUVSensitiveTreatment(treatmentKey, meta.category, meta.isLaser, meta.createsWound)) {
    return null;
  }

  // 2. 사용자 국가의 반구 확인
  const hemisphere = getHemisphere(userCountryCode);

  // 3. 현재 월 (기본값: 지금)
  const month = currentMonth ?? new Date().getMonth();

  // 4. 여름철 여부
  const isSummer = isSummerMonth(month, hemisphere);

  // 5. UV 위험도
  const uvRiskLevel = getUVRiskLevel(month, hemisphere);

  // 6. 적도 지역
  if (hemisphere === 'equatorial') {
    return {
      show: true,
      severity: 'high',
      title: {
        ko: '연중 강한 자외선 지역',
        en: 'Year-Round High UV Region'
      },
      message: {
        ko: '거주 지역은 연중 UV 지수가 높습니다. 이 시술은 강한 자외선에 노출 시 색소침착 위험이 있습니다.',
        en: 'Your region has high UV levels year-round. This treatment carries a risk of pigmentation with strong UV exposure.'
      },
      recommendation: {
        ko: '시술 후 최소 4주간 SPF 50+ 자외선 차단제를 필수적으로 사용하고, 직사광선 노출을 최소화하세요.',
        en: 'Use SPF 50+ sunscreen for at least 4 weeks post-treatment and minimize direct sun exposure.'
      },
      uvRiskLevel: 5
    };
  }

  // 7. 여름철 경고
  if (isSummer) {
    const seasonNameKo = getSeasonName(month, hemisphere, 'ko');
    const seasonNameEn = getSeasonName(month, hemisphere, 'en');

    return {
      show: true,
      severity: uvRiskLevel >= 4 ? 'critical' : 'high',
      title: {
        ko: `${seasonNameKo} 시술 주의`,
        en: `${seasonNameEn} Treatment Caution`
      },
      message: {
        ko: `현재 시기는 UV 지수가 높아 시술 후 색소침착 위험이 증가합니다. (UV 위험도: ${uvRiskLevel}/5)`,
        en: `Current season has high UV levels, increasing post-treatment pigmentation risk. (UV Risk: ${uvRiskLevel}/5)`
      },
      recommendation: {
        ko: '가능하다면 가을~겨울철로 시술 연기를 권장합니다. 시술 진행 시 반드시 SPF 50+ 자외선 차단제를 사용하고, 모자·양산으로 추가 보호하세요.',
        en: 'Consider postponing to fall/winter. If proceeding, mandatory use of SPF 50+ sunscreen and additional protection (hat/umbrella) required.'
      },
      uvRiskLevel
    };
  }

  // 8. 겨울철 (적정 시기)
  return {
    show: true,
    severity: 'low',
    title: {
      ko: '시술 적정 시기',
      en: 'Suitable Treatment Season'
    },
    message: {
      ko: '현재 시기는 UV 지수가 낮아 시술에 적합한 계절입니다.',
      en: 'Current season has lower UV levels, making it suitable for this treatment.'
    },
    recommendation: {
      ko: '시술 후에도 SPF 30+ 자외선 차단제를 꾸준히 사용하세요.',
      en: 'Continue using SPF 30+ sunscreen after treatment.'
    },
    uvRiskLevel
  };
}

/**
 * 추천 결과 리스트에 기후 경고 추가
 */
export function addClimateWarningsToRecommendations(
  recommendations: RecommendedItem[],
  userCountryCode: string
): (RecommendedItem & { climateWarning: ClimateWarning | null })[] {
  return recommendations.map(item => ({
    ...item,
    climateWarning: generateClimateWarning(item.key, userCountryCode)
  }));
}

/**
 * 전체 추천 결과에서 기후 경고가 있는 시술 수 반환
 */
export function countClimateWarnings(
  recommendations: RecommendedItem[],
  userCountryCode: string
): { total: number; critical: number; high: number } {
  let total = 0;
  let critical = 0;
  let high = 0;

  recommendations.forEach(item => {
    const warning = generateClimateWarning(item.key, userCountryCode);
    if (warning && warning.show && warning.severity !== 'low') {
      total++;
      if (warning.severity === 'critical') critical++;
      if (warning.severity === 'high') high++;
    }
  });

  return { total, critical, high };
}

/**
 * 기후 경고 요약 메시지 생성
 */
export function generateClimateWarningSummary(
  recommendations: RecommendedItem[],
  userCountryCode: string,
  lang: 'ko' | 'en' = 'en'
): string | null {
  const counts = countClimateWarnings(recommendations, userCountryCode);

  if (counts.total === 0) return null;

  if (lang === 'ko') {
    if (counts.critical > 0) {
      return `${counts.critical}개 시술이 현재 계절에 주의가 필요합니다. 상세 정보를 확인해주세요.`;
    }
    return `${counts.total}개 시술에 자외선 관련 안내가 있습니다.`;
  }

  if (counts.critical > 0) {
    return `${counts.critical} treatment(s) require extra caution this season. Please review the details.`;
  }
  return `${counts.total} treatment(s) have UV-related guidance.`;
}
