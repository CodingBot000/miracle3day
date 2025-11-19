import { TreatmentKey, Candidate, AreaId, RecommendedItem } from '@/app/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/types';
import { META } from '@/app/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/constants/treatmentMeta';
import { PRICE_TABLE } from '@/app/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/constants/prices';
import { getCurrentExchangeRate } from '@/utils/exchangeRateManager';

/**
 * 동적 환율 가져오기
 */
export const getKRWToUSD = (): number => getCurrentExchangeRate();

/**
 * KRW를 USD로 변환
 */
export const krwToUsd = (krw: number) => Math.round(krw * getKRWToUSD());

/**
 * 레이저 시술 여부
 */
export const isLaser = (t: TreatmentKey) => META[t].category === "laser" || !!META[t].isLaser;

/**
 * 주사 시술 여부
 */
export const isInjectable = (t: TreatmentKey) => META[t].category === "injectable" || !!META[t].isInjectable;

/**
 * 상처 유발 시술 여부
 */
export const createsWound = (t: TreatmentKey) => !!META[t].createsWound;

/**
 * 공통 얼굴 영역
 */
const FACE_AREAS: AreaId[] = ["full-face", "forehead", "eye-area", "cheeks", "jawline", "neck", "upper-face", "mid-face", "lower-face"];

/**
 * 영역 매핑: 신규 통합 영역 → 기존 세부 영역
 */
const AREA_MAPPINGS: Record<string, AreaId[]> = {
  "upper-face": ["forehead", "eye-area"],
  "mid-face": ["cheeks", "eye-area"],
  "lower-face": ["cheeks", "jawline"],
};

/**
 * 선택된 영역을 확장 (신규 통합 영역 → 세부 영역 매핑 포함)
 */
const expandAreas = (selected: AreaId[]): AreaId[] => {
  const expanded = new Set<AreaId>(selected);

  for (const area of selected) {
    const mapped = AREA_MAPPINGS[area];
    if (mapped) {
      mapped.forEach(a => expanded.add(a));
    }
  }

  return Array.from(expanded);
};

/**
 * 선택된 영역에 시술이 적용 가능한지 확인
 */
export const inAreas = (t: TreatmentKey, selected: AreaId[]) => {
  if (selected.length === 0) return true;

  // 영역 확장 (신규 → 기존 매핑)
  const expandedSelected = expandAreas(selected);

  if (expandedSelected.includes("full-face")) {
    return META[t].areas.some((a) => FACE_AREAS.includes(a));
  }

  return META[t].areas.some((a) => expandedSelected.includes(a));
};

/**
 * Candidate 배열에 중복 없이 추가
 */
export const addUniqueCandidates = (arr: Candidate[], add: Candidate[]) => {
  add.forEach(c => {
    if (!arr.find(x => x.key === c.key)) arr.push(c);
  });
};

/**
 * Candidate를 RecommendedItem으로 변환
 * importance와 tier 정보도 포함 (UI에서 사용)
 */
export function toRecommendedItems(cands: Candidate[]): RecommendedItem[] {
  return cands.map(c => {
    const krw = PRICE_TABLE[c.key];
    return {
      key: c.key,
      label: META[c.key].label,
      priceKRW: krw,
      priceUSD: krwToUsd(krw),
      rationale: [c.why],
      ...(c.importance && { importance: c.importance }),
      ...(c.tier && { tier: c.tier }),
    } as any; // Type assertion to allow extra fields
  });
}

/**
 * USD 포맷
 */
export const formatUSD = (usd: number) => `$${usd.toLocaleString("en-US")}`;

/**
 * KRW 포맷
 */
export const formatKRW = (krw: number) => `${krw.toLocaleString("ko-KR")}원`;
