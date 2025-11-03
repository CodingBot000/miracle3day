import { ConcernId, TreatmentGoalId, PastId } from '../types';

/**
 * 신규 통합 concern ID를 구버전 세부 ID 배열로 확장
 */
export const CONCERN_ID_EXPANSIONS: Record<string, ConcernId[]> = {
  // Tier 1: 통합 ID → 구버전 세부 ID
  "acne": ["acne", "acne-inflammatory", "acne-whiteheads"],
  "pigmentation": [
    "pigmentation",
    "pigmentation-freckles",
    "pigmentation-sun-damage",
    "pigmentation-moles",
    "pigmentation-melasma",
    "pigmentation-lentigo",
    "pigmentation-not-sure",
  ],
  "scars": ["scars", "scar-red", "scar-brown", "scar-rough"],
  "dryness": ["dryness", "dryness_glow"],

  // Tier 2
  "volume_loss": ["volume_loss", "volumizing"],

  // Tier 3: 신규 → 구버전 filler ID 매핑
  "jawline_enhancement": ["jawline_enhancement", "filler-jawline", "double_chin"],
  "nose_enhancement": ["nose_enhancement"],
  "lip_enhancement": ["lip_enhancement"],
  "cheek_contouring": ["cheek_contouring", "filler-cheeks"],
  "forehead_contouring": ["forehead_contouring", "filler-forehead"],
  "double_chin": ["double_chin", "doublie_chin"],
};

/**
 * 신규 goal ID를 구버전 goal ID로 확장
 */
export const GOAL_ID_EXPANSIONS: Record<string, TreatmentGoalId[]> = {
  "clear_skin": ["clear_skin", "acne_pore"],
  "radiant_glow": ["radiant_glow", "texture_tone"],
  "texture_improvement": ["texture_improvement", "texture_tone"],
  "facial_contouring": ["facial_contouring", "lifting_firmness"],
};

/**
 * 신규 past treatment ID를 구버전 ID로 매핑
 */
export const PAST_TREATMENT_MAPPING: Record<string, PastId[]> = {
  "never": ["none"],
  "injectables_recent": ["botox_4m", "filler_2w"],
  "injectables_past": [],  // 제한 없음
  "laser_recent": ["laser_2w"],
  "laser_past": [],  // 제한 없음
  "other_treatments": [],
  "not_sure": [],
};

/**
 * Budget ID → KRW 상한 매핑
 * 주의: 모든 값은 KRW 기준. USD 변환은 동적 환율(getCurrentExchangeRate)을 사용
 */
export const BUDGET_UPPER_LIMITS: Record<string, number> = {
  // 구버전 - KRW 기준
  "under-1000": 1320000,      // ~1000 USD (참고용)
  "1000-5000": 6600000,       // ~5000 USD (참고용)
  "5000-10000": 13200000,     // ~10000 USD (참고용)
  "10000-plus": Infinity,
  "no_limit": Infinity,
  "unsure": Infinity,

  // 신규 (form-definition.ts 동기화) - KRW 기준
  "under-500": 660000,        // ~500 USD (참고용)
  "500-1500": 1980000,        // ~1500 USD (참고용)
  "1500-3000": 3960000,       // ~3000 USD (참고용)
  "3000-5000": 6600000,       // ~5000 USD (참고용)
  "flexible": Infinity,
};
