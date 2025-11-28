import { EthnicityId, Candidate, TreatmentKey } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/types';

/**
 * 인종별 추천 시술
 * - importance를 -1 조정 (우선순위 상향)
 */
const ETHNICITY_PREFERRED_TREATMENTS: Record<EthnicityId, TreatmentKey[]> = {
  asian: [
    "toning",           // 색소침착 관리
    "genesis",          // 색소 안전
    "skinbooster-rejuran",
    "skinbooster_ha",
    "thermage_600",     // RF 효과적
    "oligio_600",
  ],

  white: [
    "botox",            // 안티에이징 주력
    "filler",
    "ulthera_400",
    "thermage_600",
    "fraxel",           // 박피 안전
    "co2",
  ],

  african: [
    "genesis",          // 비박피 레이저
    "toning",           // 장파장
    "thermage_600",     // RF (색맹 기술)
    "oligio_600",
    "skinbooster-rejuran",
  ],

  hispanic: [
    "genesis",          // 중간 출력
    "toning",
    "skinbooster-rejuran",
    "botox",
    "filler",
  ],

  middle_eastern: [
    "genesis",
    "toning",
    "thermage_600",     // RF 안전
    "skinbooster-rejuran",
  ],

  mixed: [],            // 중립적 접근
  prefer_not_to_say: [], // 중립적 접근
};

/**
 * 인종별 주의 시술
 * - importance를 +1 또는 +2 조정 (우선순위 하향)
 */
const ETHNICITY_CAUTION_TREATMENTS: Record<EthnicityId, { key: TreatmentKey; adjustment: 1 | 2; reason: string }[]> = {
  asian: [
    { key: "co2", adjustment: 1, reason: "Higher PIH risk with ablative lasers" },
    { key: "fraxel", adjustment: 1, reason: "Pseudo-hyperpigmentation risk" },
  ],

  white: [],  // 특별한 제한 없음

  african: [
    { key: "co2", adjustment: 2, reason: "Very high PIH and keloid risk" },
    { key: "fraxel", adjustment: 2, reason: "Ablative laser contraindicated" },
    { key: "secret", adjustment: 1, reason: "Wound-causing: keloid risk" },
    { key: "potenza", adjustment: 1, reason: "Microneedling: keloid caution" },
  ],

  hispanic: [
    { key: "co2", adjustment: 1, reason: "Moderate PIH risk" },
    { key: "fraxel", adjustment: 1, reason: "Hyperpigmentation risk" },
  ],

  middle_eastern: [
    { key: "co2", adjustment: 1, reason: "PIH risk with ablative lasers" },
    { key: "fraxel", adjustment: 1, reason: "Pigmentation risk" },
  ],

  mixed: [],
  prefer_not_to_say: [],
};

/**
 * 인종별 설명 라벨
 */
const ETHNICITY_LABELS: Record<EthnicityId, string> = {
  asian: "Asian skin",
  white: "Caucasian skin",
  african: "African/dark skin",
  hispanic: "Hispanic/Latino skin",
  middle_eastern: "Middle Eastern skin",
  mixed: "Mixed ethnicity",
  prefer_not_to_say: "not specified",
};

/**
 * 인종별 가중치 조정 함수
 *
 * @param cands - 현재 후보 시술 목록
 * @param ethnicity - 사용자 인종
 * @returns 조정된 후보 시술 목록
 */
export function adjustCandidatesByEthnicity(
  cands: Candidate[],
  ethnicity?: EthnicityId
): Candidate[] {
  if (!ethnicity || ethnicity === "prefer_not_to_say") {
    return cands;
  }

  const preferred = new Set(ETHNICITY_PREFERRED_TREATMENTS[ethnicity] || []);
  const cautions = ETHNICITY_CAUTION_TREATMENTS[ethnicity] || [];
  const cautionMap = new Map(cautions.map(c => [c.key, c]));

  return cands.map(c => {
    // 1. 추천 시술: importance -1 (우선순위 상향)
    if (preferred.has(c.key)) {
      return {
        ...c,
        importance: Math.max(1, c.importance - 1) as 1 | 2 | 3,
        why: `${c.why} (suitable for ${ETHNICITY_LABELS[ethnicity]})`
      };
    }

    // 2. 주의 시술: importance +1 or +2 (우선순위 하향)
    const caution = cautionMap.get(c.key);
    if (caution) {
      return {
        ...c,
        importance: Math.min(3, c.importance + caution.adjustment) as 1 | 2 | 3,
        why: `${c.why} (caution: ${caution.reason})`
      };
    }

    return c;
  });
}

/**
 * 인종별 안내 노트 생성
 *
 * @param ethnicity - 사용자 인종
 * @returns 안내 메시지 (없으면 undefined)
 */
export function generateEthnicityNote(
  ethnicity?: EthnicityId
): string | undefined {
  if (!ethnicity || ethnicity === "prefer_not_to_say") {
    return undefined;
  }

  const notes: Record<EthnicityId, string | undefined> = {
    asian: "Treatments have been optimized for Asian skin, prioritizing pigmentation-safe procedures and minimizing post-inflammatory hyperpigmentation (PIH) risk.",

    white: "Treatments have been selected with full range of laser and resurfacing options available for Caucasian skin, focusing on anti-aging and rejuvenation.",

    african: "Treatments have been carefully selected for darker skin tones, avoiding ablative lasers and prioritizing non-ablative, RF-based procedures to minimize keloid and hyperpigmentation risks.",

    hispanic: "Treatments have been adjusted for Hispanic/Latino skin, using moderate-power lasers and extra caution with pigmentation-prone procedures.",

    middle_eastern: "Treatments have been optimized for Middle Eastern skin, prioritizing longer-wavelength lasers and RF devices to minimize pigmentation risks.",

    mixed: "Treatments follow a conservative approach suitable for mixed ethnic backgrounds.",

    prefer_not_to_say: undefined,
  };

  return notes[ethnicity];
}
