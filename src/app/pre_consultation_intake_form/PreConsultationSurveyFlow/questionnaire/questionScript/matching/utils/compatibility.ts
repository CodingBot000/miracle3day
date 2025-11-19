import { ConcernId, TreatmentGoalId, PastId } from '@/app/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/types';
import {
  CONCERN_ID_EXPANSIONS,
  GOAL_ID_EXPANSIONS,
  PAST_TREATMENT_MAPPING
} from '@/app/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/constants/mappings';

/**
 * 신규 concern ID를 구버전 호환 ID 배열로 확장
 */
export function expandConcernId(id: ConcernId): ConcernId[] {
  return CONCERN_ID_EXPANSIONS[id] || [id];
}

/**
 * 신규 goal ID를 구버전 호환 ID 배열로 확장
 */
export function expandGoalId(id: TreatmentGoalId): TreatmentGoalId[] {
  return GOAL_ID_EXPANSIONS[id] || [id];
}

/**
 * 신규 past treatment ID를 구버전 ID로 정규화
 */
export function normalizePastTreatments(past: PastId[]): PastId[] {
  const normalized = new Set<PastId>(past);

  past.forEach(id => {
    const mapped = PAST_TREATMENT_MAPPING[id];
    if (mapped) {
      mapped.forEach(oldId => normalized.add(oldId));
    }
  });

  return Array.from(normalized);
}
