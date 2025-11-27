/**
 * 메인 추천 엔진
 * 기존 matchingDiagnosis.ts의 recommendTreatments 함수를 리팩토링
 *
 * 변경사항:
 * - 모듈화된 구조로 분리
 * - 신규 Tier 시스템 반영
 * - 신규 ID 지원 (하위 호환성 유지)
 * - Tier 기반 가중치 로직 추가
 */

import {
  RecommendInputs,
  RecommendationOutput,
  Candidate,
  ExcludedItem,
  Substitution,
} from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/types';

// Mappers
import { mapConcernToCandidates } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/mappers/concernMapper';
import { mapGoalToCandidates } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/mappers/goalMapper';
import { adjustCandidatesByAgeGroup, adjustCandidatesByGender } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/mappers/ageGenderMapper';

// Filters
import { filterByArea } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/filters/areaFilter';
import { substituteForPriority } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/filters/priorityFilter';
import { enforceBudget } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/filters/budgetFilter';
import { applyPastFilters } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/filters/pastTreatmentFilter';
import { applyMedicalFilters } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/filters/medicalFilter';

// Analyzers
import { analyzeTiers } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/analyzers/tierAnalyzer';
import { buildUpgradeSuggestions } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/analyzers/upgradeSuggester';

// Utils
import { addUniqueCandidates, toRecommendedItems, krwToUsd, getKRWToUSD, isInjectable, isLaser } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/utils/helpers';
import { normalizePastTreatments } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/utils/compatibility';

// Constants
import { BUDGET_UPPER_LIMITS } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/constants/mappings';
import { META } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/constants/treatmentMeta';
import { PRICE_TABLE } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/constants/prices';

/**
 * 메인 추천 함수
 */
export function recommendTreatments(input: RecommendInputs): RecommendationOutput {
  const {
    skinTypeId,
    ageGroup,
    gender,
    skinConcerns,
    treatmentGoals,
    treatmentAreas,
    budgetRangeId,
    priorityId,
    pastTreatments: rawPast,
    medicalConditions,
  } = input;

  const excluded: ExcludedItem[] = [];
  const substitutions: Substitution[] = [];
  const notes: string[] = [];

  log.debug("[MATCHING] === Step 0: Input Parameters ===");
  log.debug("skinConcerns:", skinConcerns);
  log.debug("treatmentGoals:", treatmentGoals);
  log.debug("treatmentAreas:", treatmentAreas);
  log.debug("budgetRangeId:", budgetRangeId);
  log.debug("priorityId:", priorityId);
  log.debug("rawPast:", rawPast);
  log.debug("medicalConditions:", medicalConditions);

  // Past treatments 정규화 (신규 → 구버전)
  const pastTreatments = normalizePastTreatments(rawPast);
  log.debug("Normalized pastTreatments:", pastTreatments);

  // 1) 기본 후보 수집
  let candidates: Candidate[] = [];

  log.debug("[MATCHING] === Step 1: Collecting Candidates ===");
  skinConcerns.forEach(concern => {
    const mapped = mapConcernToCandidates(concern);
    log.debug(`Concern "${concern.id}" mapped to ${mapped.length} candidates:`, mapped.map(c => c.key));
    addUniqueCandidates(candidates, mapped);
  });
  log.debug(`After concerns: ${candidates.length} candidates`);

  treatmentGoals.forEach(goal => {
    const mapped = mapGoalToCandidates(goal);
    log.debug(`Goal "${goal}" mapped to ${mapped.length} candidates:`, mapped.map(c => c.key));
    addUniqueCandidates(candidates, mapped);
  });
  log.debug(`After goals: ${candidates.length} total candidates`);

  // 1.5) Tier 분석 및 가중치 조정 (신규 기능)
  const tierAnalysis = analyzeTiers(skinConcerns);
  log.debug("[MATCHING] Tier analysis:", tierAnalysis);

  if (tierAnalysis.hasTier3) {
    // Tier 3 (성형) 선택 시 injectable 우선순위 상승
    candidates = candidates.map(c => {
      if (c.tier === 3 && isInjectable(c.key)) {
        return {
          ...c,
          importance: Math.max(1, c.importance - 1) as 1 | 2 | 3,
          why: `${c.why} (contouring priority)`
        };
      }
      return c;
    });
    notes.push("Facial contouring selected: prioritizing injectable treatments.");
  }

  if (tierAnalysis.tier1Count > tierAnalysis.tier3Count) {
    // Tier 1 (피부) 위주면 레이저 우선
    candidates = candidates.map(c => {
      if (c.tier === 1 && isLaser(c.key)) {
        return {
          ...c,
          importance: Math.max(1, c.importance - 1) as 1 | 2 | 3,
          why: `${c.why} (skin treatment priority)`
        };
      }
      return c;
    });
  }

  // 1.6) 피부타입 영향 (민감성: 통증 높거나 상처 유발은 중요도 하향)
  if (skinTypeId === "sensitive") {
    candidates = candidates.map((c) =>
      (META[c.key].createsWound || META[c.key].pain >= 6)
        ? { ...c, importance: (Math.min(3, c.importance + 1) as 1 | 2 | 3), why: `${c.why} (note: sensitive skin)` }
        : c
    );
    notes.push("Sensitive skin: consider gentler options if irritation occurs.");
  }

  // 1.7) 연령대/성별 가중치 (효과 중심)
  candidates = adjustCandidatesByAgeGroup(candidates, ageGroup);
  candidates = adjustCandidatesByGender(candidates, gender);
  log.debug(`[MATCHING] After age/gender adjustments: ${candidates.length} candidates`);

  // 2) 부위 필터
  log.debug("[MATCHING] === Step 2: Area Filter ===");
  log.debug("Before area filter:", candidates.length, "candidates");
  candidates = filterByArea(candidates, treatmentAreas, excluded);
  log.debug("After area filter:", candidates.length, "candidates");
  log.debug("Excluded so far:", excluded.length, "items");

  // 3) 우선순위 반영
  log.debug("[MATCHING] === Step 3: Priority Filter ===");
  log.debug("Before priority filter:", candidates.length, "candidates");
  candidates = substituteForPriority(candidates, priorityId, substitutions, excluded);
  log.debug("After priority filter:", candidates.length, "candidates");
  log.debug("Substitutions:", substitutions.length);

  // 4) 예산 적용
  log.debug("[MATCHING] === Step 4: Budget Filter ===");
  const budgetUpper = BUDGET_UPPER_LIMITS[budgetRangeId] || Infinity;
  log.debug("User selected budget ID:", budgetRangeId);
  log.debug("Budget upper limit:", budgetUpper === Infinity ? "Unlimited" : `${budgetUpper.toLocaleString('ko-KR')} KRW`);
  log.debug("Before budget filter:", candidates.length, "candidates");

  // 예산 적용 전 후보들의 총 가격 계산
  if (candidates.length > 0) {
    const preCandidateKeys = candidates.map(c => c.key);
    log.debug("Candidate treatment keys:", preCandidateKeys);

    // 각 후보의 가격 출력
    candidates.forEach(c => {
      const price = PRICE_TABLE[c.key] || 0;
      log.debug(`  - ${c.key}: ${price.toLocaleString('ko-KR')} KRW (importance: ${c.importance})`);
    });
  }

  candidates = enforceBudget(candidates, budgetUpper, substitutions, excluded, priorityId);
  log.debug("After budget filter:", candidates.length, "candidates");

  // 예산 적용 후 결과
  if (candidates.length > 0) {
    const postCandidateKeys = candidates.map(c => c.key);
    log.debug("Remaining after budget:", postCandidateKeys);

    let tempTotal = 0;
    candidates.forEach(c => {
      const price = PRICE_TABLE[c.key] || 0;
      tempTotal += price;
      log.debug(`  - ${c.key}: ${price.toLocaleString('ko-KR')} KRW`);
    });
    log.debug("Total after budget filter:", tempTotal.toLocaleString('ko-KR'), "KRW");
    log.debug("Within budget?", budgetUpper === Infinity ? "Yes (unlimited)" : tempTotal <= budgetUpper ? "Yes" : "No");
  } else {
    log.debug("⚠️ WARNING: All candidates removed by budget filter!");
    log.debug("Excluded count:", excluded.length);
    log.debug("Substitutions made:", substitutions.length);
  }

  // 5) 과거 시술 필터
  log.debug("[MATCHING] === Step 5: Past Treatments Filter ===");
  log.debug("Before past filter:", candidates.length, "candidates");
  candidates = applyPastFilters(candidates, pastTreatments, excluded);
  log.debug("After past filter:", candidates.length, "candidates");

  // 6) 의학적 상태 필터
  log.debug("[MATCHING] === Step 6: Medical Conditions Filter ===");
  log.debug("Before medical filter:", candidates.length, "candidates");
  candidates = applyMedicalFilters(candidates, medicalConditions, excluded, notes);
  log.debug("After medical filter:", candidates.length, "candidates");
  log.debug("Total excluded items:", excluded.length);

  // 7) 결과 변환
  log.debug("[MATCHING] Candidates before conversion:", candidates);
  const recommendations = toRecommendedItems(candidates);
  log.debug("[MATCHING] Recommendations after conversion:", recommendations);

  const totalPriceKRW = recommendations.reduce((sum, r) => {
    log.debug(`[MATCHING] Adding price: ${r.label} = ${r.priceKRW} KRW`);
    return sum + r.priceKRW;
  }, 0);
  log.debug("[MATCHING] Total KRW:", totalPriceKRW);

  const totalPriceUSD = krwToUsd(totalPriceKRW);
  log.debug("[MATCHING] Total USD:", totalPriceUSD);
  log.debug("[MATCHING] Exchange rate:", getKRWToUSD());

  // 8) 업셀 제안
  const upgradeSuggestions = buildUpgradeSuggestions(
    excluded,
    substitutions,
    priorityId,
    budgetUpper
  );

  // 9) 추가 노트
  if (pastTreatments.includes("laser_2w") || pastTreatments.includes("laser_recent")) {
    notes.push("Laser in the last 2 weeks: defer further laser until recovery.");
  }
  if (pastTreatments.includes("skinbooster_2w")) {
    notes.push("Recent skinbooster: spacing sessions helps minimize adverse events.");
  }

  // 10) 추천 결과가 없을 때 상세 분석 및 안내
  if (recommendations.length === 0 && excluded.length > 0) {
    log.debug("[MATCHING] === No Recommendations - Analyzing Exclusion Reasons ===");

    // 제외 이유 분석
    const exclusionReasons = excluded.reduce((acc, item) => {
      const reason = item.reason;
      if (!acc[reason]) {
        acc[reason] = [];
      }
      acc[reason].push(item.label);
      return acc;
    }, {} as Record<string, string[]>);

    log.debug("Exclusion breakdown:", exclusionReasons);

    // 주요 제외 이유 파악
    const reasonCounts = Object.entries(exclusionReasons).map(([reason, items]) => ({
      reason,
      count: items.length,
      items
    })).sort((a, b) => b.count - a.count);

    log.debug("Top exclusion reasons:", reasonCounts);

    // 사용자에게 명확한 피드백 제공
    const primaryReason = reasonCounts[0];

    if (primaryReason.reason.includes("Not relevant to selected area")) {
      notes.push(`No treatments match your selected area (${treatmentAreas.join(", ")}). Consider selecting a broader area or different concerns.`);
    } else if (primaryReason.reason.includes("Budget limit exceeded")) {
      notes.push(`Your budget (${budgetRangeId}) is too low for the recommended treatments. Consider increasing your budget or selecting different treatment goals.`);
    } else if (primaryReason.reason.includes("pregnancy") || primaryReason.reason.includes("Blood clotting") || primaryReason.reason.includes("Immunosuppression")) {
      notes.push(`Due to your medical condition, most treatments have been excluded for safety reasons. Please consult with a specialist for personalized recommendations.`);
    } else if (primaryReason.reason.includes("in the last")) {
      notes.push(`Recent treatments prevent new procedures. Please wait for the recommended recovery period before booking additional treatments.`);
    } else if (primaryReason.reason.includes("downtime priority")) {
      notes.push(`Your priority for minimal downtime has limited treatment options. Consider adjusting your priorities or expectations.`);
    } else {
      // 일반적인 경우
      notes.push(`Unable to find suitable treatments based on your selections. Reasons: ${reasonCounts.slice(0, 2).map(r => r.reason).join("; ")}.`);
    }

    // 대안 제안
    if (reasonCounts.length > 1) {
      const secondaryReasons = reasonCounts.slice(1, 3).map(r => `${r.count} treatments excluded due to: ${r.reason}`);
      notes.push(`Additional factors: ${secondaryReasons.join(". ")}`);
    }

    log.debug("[MATCHING] User guidance notes added:", notes);
  }

  const result = {
    recommendations,
    totalPriceKRW,
    totalPriceUSD,
    excluded,
    substitutions,
    upgradeSuggestions,
    notes,
    budgetRangeId,
    budgetUpperLimit: budgetUpper === Infinity ? undefined : budgetUpper,
  };

  log.debug("[MATCHING] === Final Result Summary ===");
  log.debug("Budget ID:", budgetRangeId);
  log.debug("Budget Limit:", budgetUpper === Infinity ? "Unlimited" : `${budgetUpper.toLocaleString('ko-KR')} KRW`);
  log.debug("Total Cost:", `${totalPriceKRW.toLocaleString('ko-KR')} KRW (${totalPriceUSD.toLocaleString('en-US')} USD)`);
  log.debug("Recommendations:", recommendations.length, "treatments");
  log.debug("Excluded:", excluded.length, "treatments");
  log.debug("[MATCHING] Full result:", result);
  return result;
}

// Export types for external use
export * from './types';
