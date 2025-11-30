import { AgeGroup, AgeGroupLegacy, Gender, Candidate, TreatmentKey } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/types';

/**
 * 새 포맷 → 레거시 포맷 매핑
 * DB 포맷(18_24, 25_34 등) → 내부 처리용(teens, 20s 등)
 */
const AGE_FORMAT_MAP: Record<string, AgeGroupLegacy> = {
  "18_24": "20s",      // 18-24 → 20s로 매핑
  "25_34": "30s",      // 25-34 → 30s로 매핑 (중간값 기준)
  "35_44": "40s",      // 35-44 → 40s로 매핑
  "45_54": "50s",      // 45-54 → 50s로 매핑
  "55_64": "60s",      // 55-64 → 60s로 매핑
  "65_plus": "70_plus", // 65+ → 70_plus로 매핑
  "prefer_not_to_say": "30s", // 기본값
};

/**
 * AgeGroup을 내부 레거시 포맷으로 정규화
 */
function normalizeAgeGroup(ageGroup?: AgeGroup): AgeGroupLegacy | undefined {
  if (!ageGroup) return undefined;

  // 이미 레거시 포맷이면 그대로 반환
  if (["teens", "20s", "30s", "40s", "50s", "60s", "70_plus", "60plus"].includes(ageGroup)) {
    return ageGroup as AgeGroupLegacy;
  }

  // 새 포맷이면 매핑
  return AGE_FORMAT_MAP[ageGroup] || "30s";
}

/**
 * 연령대별 선호 시술 (레거시 포맷 키 사용)
 */
const AGE_PREFERRED_TREATMENTS: Record<AgeGroupLegacy, TreatmentKey[]> = {
  teens: ["toning", "capri", "v_beam"],
  "20s": ["genesis", "exosome", "skinbooster-rejuran", "skinbooster_ha", "skinbooster_juvelook"],
  "30s": ["skinbooster-rejuran", "skinbooster_ha", "skinbooster_juvelook", "liftera_400", "juvelook"],
  "40s": ["ulthera_400", "thermage_600", "filler"],
  "50s": ["ulthera_400", "thermage_600", "filler"],
  "60s": ["ulthera_600", "ulthera_800", "thermage_900"],
  "70_plus": ["ulthera_600", "ulthera_800", "thermage_900"],
  "60plus": ["ulthera_600", "ulthera_800", "thermage_900"],
};

/**
 * 성별별 선호 시술
 */
const GENDER_PREFERRED_TREATMENTS: Record<Gender, TreatmentKey[]> = {
  male: ["capri", "genesis", "secret", "potenza", "filler", "scultra"],
  female: ["ulthera_400", "thermage_600", "liftera_400", "toning", "skinbooster-rejuran", "skinbooster_ha", "exosome"],
  non_binary: [],
  no_answer: [],
};

/**
 * 연령대 라벨 (레거시 포맷 키 사용)
 */
const AGE_LABELS: Record<AgeGroupLegacy, string> = {
  teens: "teens",
  "20s": "20s",
  "30s": "30s",
  "40s": "40s",
  "50s": "50s",
  "60s": "60s",
  "70_plus": "70+",
  "60plus": "60+",
};

/**
 * 연령대별 가중치 조정 (효과 우선)
 * 중요도를 1로 상향 조정
 * 새 포맷(18_24, 25_34 등)과 레거시 포맷(20s, 30s 등) 모두 지원
 */
export function adjustCandidatesByAgeGroup(cands: Candidate[], ageGroup?: AgeGroup): Candidate[] {
  if (!ageGroup) return cands;

  // 새 포맷을 레거시 포맷으로 정규화
  const normalizedAge = normalizeAgeGroup(ageGroup);
  if (!normalizedAge) return cands;

  const preferred = new Set(AGE_PREFERRED_TREATMENTS[normalizedAge] || []);

  return cands.map(c =>
    preferred.has(c.key)
      ? { ...c, importance: 1, why: `${c.why} (preferred for ${AGE_LABELS[normalizedAge]})` }
      : c
  );
}

/**
 * 성별별 가중치 조정 (효과 우선)
 * 중요도를 1로 상향 조정
 */
export function adjustCandidatesByGender(cands: Candidate[], gender?: Gender): Candidate[] {
  if (!gender) return cands;
  const preferred = new Set(GENDER_PREFERRED_TREATMENTS[gender] || []);
  const note = gender === "male" ? "male-preferred" : gender === "female" ? "female-preferred" : "";

  return cands.map(c =>
    preferred.has(c.key)
      ? { ...c, importance: 1, why: note ? `${c.why} (${note})` : c.why }
      : c
  );
}
