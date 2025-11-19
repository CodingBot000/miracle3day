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
} from './types';

// Mappers
import { mapConcernToCandidates } from './mappers/concernMapper';
import { mapGoalToCandidates } from './mappers/goalMapper';
import { adjustCandidatesByAgeGroup, adjustCandidatesByGender } from './mappers/ageGenderMapper';

// Filters
import { filterByArea } from './filters/areaFilter';
import { substituteForPriority } from './filters/priorityFilter';
import { enforceBudget } from './filters/budgetFilter';
import { applyPastFilters } from './filters/pastTreatmentFilter';
import { applyMedicalFilters } from './filters/medicalFilter';

// Analyzers
import { analyzeTiers } from './analyzers/tierAnalyzer';
import { buildUpgradeSuggestions } from './analyzers/upgradeSuggester';

// Utils
import { addUniqueCandidates, toRecommendedItems, krwToUsd, getKRWToUSD, isInjectable, isLaser } from './utils/helpers';
import { normalizePastTreatments } from './utils/compatibility';

// Constants
import { BUDGET_UPPER_LIMITS } from './constants/mappings';
import { META } from './constants/treatmentMeta';
import { PRICE_TABLE } from './constants/prices';

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

  console.log("[MATCHING] === Step 0: Input Parameters ===");
  console.log("skinConcerns:", skinConcerns);
  console.log("treatmentGoals:", treatmentGoals);
  console.log("treatmentAreas:", treatmentAreas);
  console.log("budgetRangeId:", budgetRangeId);
  console.log("priorityId:", priorityId);
  console.log("rawPast:", rawPast);
  console.log("medicalConditions:", medicalConditions);

  // Past treatments 정규화 (신규 → 구버전)
  const pastTreatments = normalizePastTreatments(rawPast);
  console.log("Normalized pastTreatments:", pastTreatments);

  // 1) 기본 후보 수집
  let candidates: Candidate[] = [];

  console.log("[MATCHING] === Step 1: Collecting Candidates ===");
  skinConcerns.forEach(concern => {
    const mapped = mapConcernToCandidates(concern);
    console.log(`Concern "${concern.id}" mapped to ${mapped.length} candidates:`, mapped.map(c => c.key));
    addUniqueCandidates(candidates, mapped);
  });
  console.log(`After concerns: ${candidates.length} candidates`);

  treatmentGoals.forEach(goal => {
    const mapped = mapGoalToCandidates(goal);
    console.log(`Goal "${goal}" mapped to ${mapped.length} candidates:`, mapped.map(c => c.key));
    addUniqueCandidates(candidates, mapped);
  });
  console.log(`After goals: ${candidates.length} total candidates`);

  // 1.5) Tier 분석 및 가중치 조정 (신규 기능)
  const tierAnalysis = analyzeTiers(skinConcerns);
  console.log("[MATCHING] Tier analysis:", tierAnalysis);

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
  console.log(`[MATCHING] After age/gender adjustments: ${candidates.length} candidates`);

  // 2) 부위 필터
  console.log("[MATCHING] === Step 2: Area Filter ===");
  console.log("Before area filter:", candidates.length, "candidates");
  candidates = filterByArea(candidates, treatmentAreas, excluded);
  console.log("After area filter:", candidates.length, "candidates");
  console.log("Excluded so far:", excluded.length, "items");

  // 3) 우선순위 반영
  console.log("[MATCHING] === Step 3: Priority Filter ===");
  console.log("Before priority filter:", candidates.length, "candidates");
  candidates = substituteForPriority(candidates, priorityId, substitutions, excluded);
  console.log("After priority filter:", candidates.length, "candidates");
  console.log("Substitutions:", substitutions.length);

  // 4) 예산 적용
  console.log("[MATCHING] === Step 4: Budget Filter ===");
  const budgetUpper = BUDGET_UPPER_LIMITS[budgetRangeId] || Infinity;
  console.log("User selected budget ID:", budgetRangeId);
  console.log("Budget upper limit:", budgetUpper === Infinity ? "Unlimited" : `${budgetUpper.toLocaleString('ko-KR')} KRW`);
  console.log("Before budget filter:", candidates.length, "candidates");

  // 예산 적용 전 후보들의 총 가격 계산
  if (candidates.length > 0) {
    const preCandidateKeys = candidates.map(c => c.key);
    console.log("Candidate treatment keys:", preCandidateKeys);

    // 각 후보의 가격 출력
    candidates.forEach(c => {
      const price = PRICE_TABLE[c.key] || 0;
      console.log(`  - ${c.key}: ${price.toLocaleString('ko-KR')} KRW (importance: ${c.importance})`);
    });
  }

  candidates = enforceBudget(candidates, budgetUpper, substitutions, excluded, priorityId);
  console.log("After budget filter:", candidates.length, "candidates");

  // 예산 적용 후 결과
  if (candidates.length > 0) {
    const postCandidateKeys = candidates.map(c => c.key);
    console.log("Remaining after budget:", postCandidateKeys);

    let tempTotal = 0;
    candidates.forEach(c => {
      const price = PRICE_TABLE[c.key] || 0;
      tempTotal += price;
      console.log(`  - ${c.key}: ${price.toLocaleString('ko-KR')} KRW`);
    });
    console.log("Total after budget filter:", tempTotal.toLocaleString('ko-KR'), "KRW");
    console.log("Within budget?", budgetUpper === Infinity ? "Yes (unlimited)" : tempTotal <= budgetUpper ? "Yes" : "No");
  } else {
    console.log("⚠️ WARNING: All candidates removed by budget filter!");
    console.log("Excluded count:", excluded.length);
    console.log("Substitutions made:", substitutions.length);
  }

  // 5) 과거 시술 필터
  console.log("[MATCHING] === Step 5: Past Treatments Filter ===");
  console.log("Before past filter:", candidates.length, "candidates");
  candidates = applyPastFilters(candidates, pastTreatments, excluded);
  console.log("After past filter:", candidates.length, "candidates");

  // 6) 의학적 상태 필터
  console.log("[MATCHING] === Step 6: Medical Conditions Filter ===");
  console.log("Before medical filter:", candidates.length, "candidates");
  candidates = applyMedicalFilters(candidates, medicalConditions, excluded, notes);
  console.log("After medical filter:", candidates.length, "candidates");
  console.log("Total excluded items:", excluded.length);

  // 7) 결과 변환
  console.log("[MATCHING] Candidates before conversion:", candidates);
  const recommendations = toRecommendedItems(candidates);
  console.log("[MATCHING] Recommendations after conversion:", recommendations);

  const totalPriceKRW = recommendations.reduce((sum, r) => {
    console.log(`[MATCHING] Adding price: ${r.label} = ${r.priceKRW} KRW`);
    return sum + r.priceKRW;
  }, 0);
  console.log("[MATCHING] Total KRW:", totalPriceKRW);

  const totalPriceUSD = krwToUsd(totalPriceKRW);
  console.log("[MATCHING] Total USD:", totalPriceUSD);
  console.log("[MATCHING] Exchange rate:", getKRWToUSD());

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
    console.log("[MATCHING] === No Recommendations - Analyzing Exclusion Reasons ===");

    // 제외 이유 분석
    const exclusionReasons = excluded.reduce((acc, item) => {
      const reason = item.reason;
      if (!acc[reason]) {
        acc[reason] = [];
      }
      acc[reason].push(item.label);
      return acc;
    }, {} as Record<string, string[]>);

    console.log("Exclusion breakdown:", exclusionReasons);

    // 주요 제외 이유 파악
    const reasonCounts = Object.entries(exclusionReasons).map(([reason, items]) => ({
      reason,
      count: items.length,
      items
    })).sort((a, b) => b.count - a.count);

    console.log("Top exclusion reasons:", reasonCounts);

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

    console.log("[MATCHING] User guidance notes added:", notes);
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

  console.log("[MATCHING] === Final Result Summary ===");
  console.log("Budget ID:", budgetRangeId);
  console.log("Budget Limit:", budgetUpper === Infinity ? "Unlimited" : `${budgetUpper.toLocaleString('ko-KR')} KRW`);
  console.log("Total Cost:", `${totalPriceKRW.toLocaleString('ko-KR')} KRW (${totalPriceUSD.toLocaleString('en-US')} USD)`);
  console.log("Recommendations:", recommendations.length, "treatments");
  console.log("Excluded:", excluded.length, "treatments");
  console.log("[MATCHING] Full result:", result);
  return result;
}

// Export types for external use
export * from './types';
