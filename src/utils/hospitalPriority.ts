/**
 * ============================================================================
 * 🎯 병원 우선순위 관리 유틸리티 (임시 - 나중에 제거 예정)
 * ============================================================================
 *
 * 병원 목록에서 특정 병원들의 노출 순서를 제어하는 공통 로직
 * - 최상위 우선순위 병원: 일정 확률로 상단 노출
 * - 최하위 병원: 항상 마지막에 노출
 */

import { HospitalData } from "@/models/hospitalData.dto";

// ============================================================================
// 우선순위 설정
// ============================================================================
export const PRIORITY_CONFIG = {
  // 최상위 노출 우선순위 병원 (확률적으로 상단 노출)
  topPriorityIds: [
    'a8aa77a6-57a0-4bbc-8d48-6a12305e8272', // 오르타의원
    '7827c1a8-aaa0-449f-92f0-5cb55e16566d', // reone
    '18ac6e34-64aa-4edb-80f3-8f343c6aae1f', // 1mm성형외과의원
    'ea7e9176-dc64-4549-84ee-b9f08722f1bf', // 워나
  ],

  // 항상 마지막 노출 병원
  alwaysLastIds: [
    'e836a0f5-ff6a-4ca7-b904-5a7943d955e0', // 미모톡병원
  ],

  // 최상위 노출 확률 (0.0 ~ 1.0)
  topPriorityProbability: 0.5,

  // 최상단에 배치할 우선순위 병원 개수
  topPriorityCount: 2,
} as const;

// ============================================================================
// Fisher-Yates shuffle algorithm
// ============================================================================
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================================
// 우선순위 적용 함수
// ============================================================================
/**
 * 병원 목록에 우선순위 규칙을 적용
 *
 * @param hospitals - 원본 병원 목록 (이미 셔플된 상태)
 * @returns 우선순위가 적용된 병원 목록
 *
 * 처리 순서:
 * 1. 항상 마지막에 나올 병원 분리
 * 2. 우선순위 병원 중 N개를 랜덤 선택하여 최상단 배치 (확률적)
 * 3. 항상 마지막 병원을 끝에 추가
 */
export function applyPriorityRules(hospitals: HospitalData[]): HospitalData[] {
  if (hospitals.length === 0) return hospitals;

  let result = [...hospitals];

  // 1. 항상 마지막에 나올 병원 분리
  const alwaysLastHospitals = result.filter(h =>
    PRIORITY_CONFIG.alwaysLastIds.includes(h.id_uuid!)
  );
  result = result.filter(h =>
    !PRIORITY_CONFIG.alwaysLastIds.includes(h.id_uuid!)
  );

  // 2. 우선순위 병원 처리
  const priorityHospitals = result.filter(h =>
    PRIORITY_CONFIG.topPriorityIds.includes(h.id_uuid!)
  );

  if (priorityHospitals.length > 0) {
    // 설정된 확률로 우선순위 병원을 최상단에 배치
    if (Math.random() < PRIORITY_CONFIG.topPriorityProbability) {
      // 우선순위 병원 중 N개 선택 (설정된 개수만큼, 가능한 경우)
      const selectCount = Math.min(
        PRIORITY_CONFIG.topPriorityCount,
        priorityHospitals.length
      );
      const shuffledPriority = shuffleArray(priorityHospitals);
      const selectedPriorities = shuffledPriority.slice(0, selectCount);

      // 선택된 병원들을 제외한 나머지
      const selectedIds = selectedPriorities.map(h => h.id_uuid);
      result = result.filter(h => !selectedIds.includes(h.id_uuid));

      // 최상단에 배치 (역순으로 unshift하면 원래 순서 유지)
      for (let i = selectedPriorities.length - 1; i >= 0; i--) {
        result.unshift(selectedPriorities[i]);
      }
    }
  }

  // 3. 항상 마지막 병원을 끝에 추가
  return [...result, ...alwaysLastHospitals];
}

// ============================================================================
// 병원 목록 랜덤화 + 우선순위 적용 (통합 함수)
// ============================================================================
/**
 * 병원 목록을 랜덤화하고 우선순위 규칙을 적용
 *
 * @param hospitals - 원본 병원 목록
 * @returns 셔플 + 우선순위가 적용된 병원 목록
 */
export function shuffleAndApplyPriority(hospitals: HospitalData[]): HospitalData[] {
  const shuffled = shuffleArray(hospitals);
  return applyPriorityRules(shuffled);
}
