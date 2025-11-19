import { AgeGroup, Gender, Candidate, TreatmentKey } from '@/app/(site)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/types';

/**
 * 연령대별 선호 시술
 */
const AGE_PREFERRED_TREATMENTS: Record<AgeGroup, TreatmentKey[]> = {
  teens: ["toning", "capri", "v_beam"],
  "20s": ["genesis", "exosome", "skinbooster-rejuran", "skinbooster_ha", "skinbooster_juvelook"],
  "30s": ["skinbooster-rejuran", "skinbooster_ha", "skinbooster_juvelook", "liftera_400", "juvelook"],
  "40s": ["ulthera_400", "thermage_600", "filler"],
  "50s": ["ulthera_400", "thermage_600", "filler"],
  "60s": ["ulthera_600", "ulthera_800", "thermage_900"],
  "70_plus": ["ulthera_600", "ulthera_800", "thermage_900"],
  "60plus": ["ulthera_600", "ulthera_800", "thermage_900"], // 신규
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
 * 연령대 라벨
 */
const AGE_LABELS: Record<AgeGroup, string> = {
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
 */
export function adjustCandidatesByAgeGroup(cands: Candidate[], ageGroup?: AgeGroup): Candidate[] {
  if (!ageGroup) return cands;
  const preferred = new Set(AGE_PREFERRED_TREATMENTS[ageGroup] || []);

  return cands.map(c =>
    preferred.has(c.key)
      ? { ...c, importance: 1, why: `${c.why} (preferred for ${AGE_LABELS[ageGroup]})` }
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
