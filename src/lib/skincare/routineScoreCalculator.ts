/**
 * 루틴 점수 계산기
 *
 * 사용자가 편집한 스킨케어 루틴의 품질을 점수(0-100)로 평가
 * - 순서 점수: 0-60
 * - 완성도 점수: 0-25
 * - 성분 조화 점수: 0-15 (Phase 2, 현재 만점 처리)
 */

// ========== 인터페이스 ==========

export interface RoutineScore {
  total: number;                    // 0-100
  breakdown: {
    order_score: number;            // 0-60
    completeness_score: number;     // 0-25
    ingredient_score: number;       // 0-15 (Phase 2, 일단 만점)
  };
  issues: RoutineIssue[];
  suggestions: Suggestion[];
}

export interface RoutineIssue {
  id: string;
  type: 'order' | 'missing_step' | 'ingredient_conflict';
  severity: 'critical' | 'warning' | 'tip';
  points_deducted: number;
  message_ko: string;
  message_en: string;
  affected_steps: string[];         // step_type 배열
}

export interface Suggestion {
  id: string;
  action: 'reorder' | 'add_step' | 'remove_step' | 'separate_routine';
  message_ko: string;
  message_en: string;
  target_steps?: string[];
}

export interface RoutineStep {
  id: string | number;
  step_type: string;
  step_order: number;
  product_id?: number;
  is_enabled?: boolean;
}

export type RoutineType = 'morning' | 'midday' | 'evening';

// ========== 점수 규칙 상수 ==========

/**
 * 스텝 순서 맵 - 낮은 숫자가 먼저 사용되어야 함
 */
export const STEP_ORDER_MAP: Record<string, number> = {
  cleanser: 100,
  exfoliant: 150,
  toner: 200,
  mist: 250,
  essence: 300,
  serum: 300,
  mask: 350,
  eye_cream: 400,
  moisturizer: 500,
  facial_oil: 550,
  treatment: 600,
  sleeping_mask: 700,
  lip_care: 800,
  sunscreen: 900,
  blotting_paper: 50,  // 낮에는 맨 앞
};

/**
 * 순서 규칙 위반 정의
 */
interface OrderRule {
  id: string;
  check: (steps: RoutineStep[], routineType: RoutineType) => RoutineStep[] | null;
  deduction: number;
  severity: 'critical' | 'warning' | 'tip';
  message_ko: string;
  message_en: string;
}

const ORDER_RULES: OrderRule[] = [
  // Critical (-20)
  {
    id: 'cleanser_not_first',
    check: (steps, routineType) => {
      if (routineType === 'midday') return null; // 낮에는 클렌저 필요 없음
      if (steps.length === 0) return null;

      const firstStep = steps[0];
      const cleanserIndex = steps.findIndex(s => s.step_type === 'cleanser');

      if (cleanserIndex > 0) {
        return [steps[cleanserIndex], firstStep];
      }
      return null;
    },
    deduction: 20,
    severity: 'critical',
    message_ko: '클렌저로 먼저 세안해야 다른 제품이 흡수돼요',
    message_en: 'Start with cleanser for better product absorption'
  },
  {
    id: 'sunscreen_not_last',
    check: (steps, routineType) => {
      if (routineType === 'evening') return null; // 저녁에는 선크림 필요 없음
      if (steps.length === 0) return null;

      const sunscreenIndex = steps.findIndex(s => s.step_type === 'sunscreen');
      if (sunscreenIndex === -1) return null;

      const lastStep = steps[steps.length - 1];
      if (lastStep.step_type !== 'sunscreen' && sunscreenIndex !== -1) {
        return [steps[sunscreenIndex], lastStep];
      }
      return null;
    },
    deduction: 20,
    severity: 'critical',
    message_ko: '선크림 위에 다른 제품을 바르면 자외선 차단 효과가 떨어져요',
    message_en: 'Sunscreen should be last - other products reduce UV protection'
  },
  {
    id: 'oil_before_water',
    check: (steps) => {
      const oilBasedTypes = ['facial_oil', 'sleeping_mask'];
      const waterBasedTypes = ['toner', 'essence', 'serum'];

      for (let i = 0; i < steps.length - 1; i++) {
        if (oilBasedTypes.includes(steps[i].step_type)) {
          for (let j = i + 1; j < steps.length; j++) {
            if (waterBasedTypes.includes(steps[j].step_type)) {
              return [steps[i], steps[j]];
            }
          }
        }
      }
      return null;
    },
    deduction: 15,
    severity: 'critical',
    message_ko: '오일 제품 후에 수분 제품은 흡수되지 않아요',
    message_en: 'Water-based products cannot penetrate after oil-based ones'
  },
  // Warning (-10)
  {
    id: 'serum_before_toner',
    check: (steps) => {
      const tonerIndex = steps.findIndex(s => s.step_type === 'toner');
      const serumIndex = steps.findIndex(s => s.step_type === 'serum');

      if (tonerIndex !== -1 && serumIndex !== -1 && serumIndex < tonerIndex) {
        return [steps[serumIndex], steps[tonerIndex]];
      }
      return null;
    },
    deduction: 10,
    severity: 'warning',
    message_ko: '토너로 피부결을 정돈한 후 세럼을 바르면 더 잘 흡수돼요',
    message_en: 'Toner prepares skin for better serum absorption'
  },
  {
    id: 'moisturizer_before_serum',
    check: (steps) => {
      const serumIndex = steps.findIndex(s => s.step_type === 'serum');
      const moisturizerIndex = steps.findIndex(s => s.step_type === 'moisturizer');

      if (serumIndex !== -1 && moisturizerIndex !== -1 && moisturizerIndex < serumIndex) {
        return [steps[moisturizerIndex], steps[serumIndex]];
      }
      return null;
    },
    deduction: 10,
    severity: 'warning',
    message_ko: '모이스처라이저는 세럼 후에 발라야 효과가 좋아요',
    message_en: 'Apply moisturizer after serum for best results'
  },
  // Tip (-5)
  {
    id: 'eye_cream_timing',
    check: (steps) => {
      const eyeCreamIndex = steps.findIndex(s => s.step_type === 'eye_cream');
      const moisturizerIndex = steps.findIndex(s => s.step_type === 'moisturizer');

      // 아이크림은 모이스처라이저 전에 바르는 것이 좋음
      if (eyeCreamIndex !== -1 && moisturizerIndex !== -1 && eyeCreamIndex > moisturizerIndex) {
        return [steps[eyeCreamIndex], steps[moisturizerIndex]];
      }
      return null;
    },
    deduction: 5,
    severity: 'tip',
    message_ko: '아이크림은 모이스처라이저 전에 바르면 더 효과적이에요',
    message_en: 'Eye cream works better before moisturizer'
  },
  {
    id: 'essence_before_serum',
    check: (steps) => {
      const essenceIndex = steps.findIndex(s => s.step_type === 'essence');
      const serumIndex = steps.findIndex(s => s.step_type === 'serum');

      if (essenceIndex !== -1 && serumIndex !== -1 && essenceIndex > serumIndex) {
        return [steps[essenceIndex], steps[serumIndex]];
      }
      return null;
    },
    deduction: 5,
    severity: 'tip',
    message_ko: '에센스는 세럼보다 먼저 사용하면 좋아요 (더 가벼운 텍스처)',
    message_en: 'Apply essence before serum (lighter texture first)'
  }
];

/**
 * 완성도 규칙 정의
 */
interface CompletenessRule {
  id: string;
  check: (steps: RoutineStep[], routineType: RoutineType) => boolean;
  deduction: number;
  severity: 'critical' | 'warning' | 'tip';
  message_ko: string;
  message_en: string;
  step_type: string;
}

const COMPLETENESS_RULES: CompletenessRule[] = [
  {
    id: 'missing_cleanser',
    check: (steps, routineType) => {
      if (routineType === 'midday') return false; // 낮에는 클렌저 불필요
      return !steps.some(s => s.step_type === 'cleanser');
    },
    deduction: 10,
    severity: 'critical',
    message_ko: '클렌징은 스킨케어의 첫 번째 단계예요',
    message_en: 'Cleansing is the first step of skincare',
    step_type: 'cleanser'
  },
  {
    id: 'missing_sunscreen_morning',
    check: (steps, routineType) => {
      if (routineType === 'evening') return false; // 저녁에는 선크림 불필요
      return !steps.some(s => s.step_type === 'sunscreen');
    },
    deduction: 10,
    severity: 'critical',
    message_ko: '자외선 차단은 피부 노화 방지의 핵심이에요',
    message_en: 'Sunscreen is essential for preventing skin aging',
    step_type: 'sunscreen'
  },
  {
    id: 'missing_moisturizer',
    check: (steps) => {
      return !steps.some(s => s.step_type === 'moisturizer');
    },
    deduction: 8,
    severity: 'warning',
    message_ko: '보습은 모든 피부 타입에 필수예요',
    message_en: 'Moisturizing is essential for all skin types',
    step_type: 'moisturizer'
  }
];

// ========== 메인 함수 ==========

/**
 * 루틴 점수 계산
 */
export function calculateRoutineScore(
  steps: RoutineStep[],
  routineType: RoutineType
): RoutineScore {
  const issues: RoutineIssue[] = [];
  const suggestions: Suggestion[] = [];

  // 활성화된 스텝만 필터링
  const enabledSteps = steps.filter(s => s.is_enabled !== false);

  // 1. 순서 점수 계산 (만점 60)
  let orderScore = 60;

  for (const rule of ORDER_RULES) {
    const violatedSteps = rule.check(enabledSteps, routineType);
    if (violatedSteps) {
      orderScore -= rule.deduction;
      issues.push({
        id: rule.id,
        type: 'order',
        severity: rule.severity,
        points_deducted: rule.deduction,
        message_ko: rule.message_ko,
        message_en: rule.message_en,
        affected_steps: violatedSteps.map(s => s.step_type)
      });

      // 제안 추가
      suggestions.push({
        id: `fix_${rule.id}`,
        action: 'reorder',
        message_ko: `${getStepNameKo(violatedSteps[0].step_type)}의 순서를 변경해 보세요`,
        message_en: `Consider reordering ${violatedSteps[0].step_type}`,
        target_steps: violatedSteps.map(s => s.step_type)
      });
    }
  }
  orderScore = Math.max(0, orderScore);

  // 2. 완성도 점수 계산 (만점 25)
  let completenessScore = 25;

  for (const rule of COMPLETENESS_RULES) {
    if (rule.check(enabledSteps, routineType)) {
      completenessScore -= rule.deduction;
      issues.push({
        id: rule.id,
        type: 'missing_step',
        severity: rule.severity,
        points_deducted: rule.deduction,
        message_ko: rule.message_ko,
        message_en: rule.message_en,
        affected_steps: [rule.step_type]
      });

      // 제안 추가
      suggestions.push({
        id: `add_${rule.step_type}`,
        action: 'add_step',
        message_ko: `${getStepNameKo(rule.step_type)}를 추가해 보세요`,
        message_en: `Consider adding ${rule.step_type}`,
        target_steps: [rule.step_type]
      });
    }
  }
  completenessScore = Math.max(0, completenessScore);

  // 3. 성분 조화 점수 (Phase 2 - 현재 만점)
  const ingredientScore = 15;

  // 총점 계산
  const total = orderScore + completenessScore + ingredientScore;

  return {
    total,
    breakdown: {
      order_score: orderScore,
      completeness_score: completenessScore,
      ingredient_score: ingredientScore
    },
    issues,
    suggestions
  };
}

/**
 * 권장 순서로 스텝 정렬
 */
export function sortStepsByRecommendedOrder(steps: RoutineStep[]): RoutineStep[] {
  return [...steps].sort((a, b) => {
    const orderA = STEP_ORDER_MAP[a.step_type] ?? 500;
    const orderB = STEP_ORDER_MAP[b.step_type] ?? 500;
    return orderA - orderB;
  });
}

/**
 * 자동 정렬 - 권장 순서로 정렬하고 step_order 업데이트
 */
export function autoSortRoutine<T extends RoutineStep>(steps: T[]): T[] {
  return [...steps]
    .sort((a, b) => {
      const orderA = STEP_ORDER_MAP[a.step_type] ?? 999;
      const orderB = STEP_ORDER_MAP[b.step_type] ?? 999;
      return orderA - orderB;
    })
    .map((step, index) => ({
      ...step,
      step_order: index + 1,
    }));
}

/**
 * 점수에 따른 등급 반환
 */
export function getScoreGrade(score: number): {
  grade: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  color: string;
  emoji: string;
} {
  if (score >= 95) {
    return { grade: 'excellent', color: '#10B981', emoji: '🌟' };
  } else if (score >= 80) {
    return { grade: 'good', color: '#3B82F6', emoji: '👍' };
  } else if (score >= 60) {
    return { grade: 'fair', color: '#F59E0B', emoji: '💪' };
  } else {
    return { grade: 'needs_improvement', color: '#6B7280', emoji: '🔧' };
  }
}

/**
 * 스텝 타입의 한국어 이름
 */
function getStepNameKo(stepType: string): string {
  const names: Record<string, string> = {
    cleanser: '클렌저',
    exfoliant: '각질제거제',
    toner: '토너',
    mist: '미스트',
    essence: '에센스',
    serum: '세럼',
    mask: '마스크',
    eye_cream: '아이크림',
    moisturizer: '모이스처라이저',
    facial_oil: '페이셜 오일',
    treatment: '트리트먼트',
    sleeping_mask: '슬리핑 마스크',
    lip_care: '립케어',
    sunscreen: '선크림',
    blotting_paper: '기름종이'
  };
  return names[stepType] || stepType;
}

/**
 * 잘하고 있는 항목 체크
 */
export function getGoodPractices(
  steps: RoutineStep[],
  routineType: RoutineType
): { id: string; message_ko: string; message_en: string }[] {
  const practices: { id: string; message_ko: string; message_en: string }[] = [];
  const enabledSteps = steps.filter(s => s.is_enabled !== false);

  // 클렌저가 첫 번째
  if (routineType !== 'midday' && enabledSteps.length > 0 && enabledSteps[0].step_type === 'cleanser') {
    practices.push({
      id: 'cleanser_first',
      message_ko: '클렌저로 시작하는 올바른 순서예요!',
      message_en: 'Great! Starting with cleanser is correct!'
    });
  }

  // 선크림이 마지막 (아침/낮)
  if (routineType !== 'evening' && enabledSteps.length > 0) {
    const lastStep = enabledSteps[enabledSteps.length - 1];
    if (lastStep.step_type === 'sunscreen') {
      practices.push({
        id: 'sunscreen_last',
        message_ko: '선크림을 마지막에 바르는 완벽한 순서예요!',
        message_en: 'Perfect! Sunscreen is correctly applied last!'
      });
    }
  }

  // 토너 → 세럼 순서
  const tonerIndex = enabledSteps.findIndex(s => s.step_type === 'toner');
  const serumIndex = enabledSteps.findIndex(s => s.step_type === 'serum');
  if (tonerIndex !== -1 && serumIndex !== -1 && tonerIndex < serumIndex) {
    practices.push({
      id: 'toner_before_serum',
      message_ko: '토너 후 세럼 순서가 완벽해요!',
      message_en: 'Toner before serum - perfect order!'
    });
  }

  // 더블 클렌징 (저녁)
  if (routineType === 'evening') {
    const cleanserCount = enabledSteps.filter(s => s.step_type === 'cleanser').length;
    if (cleanserCount >= 2) {
      practices.push({
        id: 'double_cleanse',
        message_ko: '더블 클렌징으로 깨끗하게!',
        message_en: 'Double cleansing for thorough cleaning!'
      });
    }
  }

  return practices;
}
