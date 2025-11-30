import { TreatmentGoalId, Candidate } from '@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/types';
import { expandGoalId } from '@/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/utils/compatibility';

/**
 * Treatment Goal → Candidate 매핑
 * 기존 baseCandidatesByGoal 함수를 개선한 버전
 */
export function mapGoalToCandidates(goal: TreatmentGoalId): Candidate[] {
  const candidates: Candidate[] = [];
  const expandedIds = expandGoalId(goal);

  expandedIds.forEach(id => {
    const mapped = GOAL_TO_TREATMENTS[id];
    if (mapped) {
      candidates.push(...mapped);
    }
  });

  return candidates;
}

/**
 * Goal ID → Treatment 매핑 테이블
 * 기존 matchingDiagnosis.ts의 baseCandidatesByGoal 로직을 테이블로 변환
 */
const GOAL_TO_TREATMENTS: Record<TreatmentGoalId, Candidate[]> = {
  // 신규 goals
  "clear_skin": [
    { key: "potenza", importance: 1, why: "Acne & pore treatment" },
    { key: "toning", importance: 2, why: "Even skin tone" },
  ],

  "radiant_glow": [
    { key: "exosome", importance: 1, why: "Instant brightening" },
    { key: "skinbooster_ha", importance: 2, why: "Radiance boost" },
    { key: "toning", importance: 2, why: "Tone evening" },
  ],

  "anti_aging": [
    { key: "botox", importance: 1, why: "Dynamic wrinkles" },
    { key: "ulthera_400", importance: 1, why: "Lifting for sagging" },
    { key: "skinbooster-rejuran", importance: 2, why: "Regeneration + hydration" },
  ],

  "texture_improvement": [
    { key: "potenza", importance: 1, why: "Texture refinement" },
    { key: "fraxel", importance: 2, why: "Skin resurfacing" },
  ],

  "facial_contouring": [
    { key: "filler", importance: 1, why: "Facial sculpting" },
    { key: "ulthera_400", importance: 2, why: "Lifting effect" },
    { key: "botox", importance: 2, why: "Facial slimming" },
  ],

  "recommendation": [
    { key: "repot_or_toning_and_genesis", importance: 1, why: "Balanced entry package" },
    { key: "skinbooster_ha", importance: 2, why: "Hydration and glow" },
    { key: "botox", importance: 3, why: "Common preventative" },
  ],

  // 구버전 goals
  "overall_refresh": [
    { key: "repot_or_toning_and_genesis", importance: 1, why: "Overall tone/texture refresh" },
    { key: "skinbooster_ha", importance: 2, why: "Hydration and glow" },
  ],

  "lifting_firmness": [
    { key: "ulthera_400", importance: 1, why: "HIFU lifting for contour" },
    { key: "thermage_600", importance: 1, why: "RF tightening for firmness" },
    { key: "liftera_400", importance: 2, why: "Value option for lifting" },
    { key: "scultra", importance: 2, why: "Collagen stimulation" },
  ],

  "texture_tone": [
    { key: "genesis", importance: 1, why: "Texture refinement" },
    { key: "toning", importance: 1, why: "Tone/pigment balance" },
    { key: "fraxel", importance: 2, why: "Resurfacing for stubborn texture" },
  ],

  "acne_pore": [
    { key: "capri", importance: 1, why: "Acne and sebaceous control" },
    { key: "genesis", importance: 1, why: "Pore refinement" },
    { key: "potenza", importance: 2, why: "RF microneedling for pores/scars" },
  ],
};
