/**
 * 모든 타입 정의를 한 곳에 모음
 * - 기존 matchingDiagnosis.ts의 타입 정의
 * - form-definition.ts와 동기화된 신규 타입
 */

// ─────────────────────────────────────────────────────────
// Treatment Keys
// ─────────────────────────────────────────────────────────
export type TreatmentKey =
  | "botox"
  | "capri"
  | "co2"
  | "density_600"
  | "density_900"
  | "exel_v"
  | "exosome"
  | "filler"
  | "genesis"
  | "gensis" // 오타 대응
  | "inmode"
  | "juvegen"
  | "juvelook"
  | "liftera_200"
  | "liftera_400"
  | "liftera_600"
  | "liftera_800"
  | "neobeam"
  | "oligio_600"
  | "oligio_900"
  | "onda"
  | "potenza"
  | "fraxel"
  | "repot_or_toning_and_genesis"
  | "scultra"
  | "secret"
  | "shrink_200"
  | "shrink_400"
  | "shrink_600"
  | "shrink_800"
  | "skinbooster-rejuran"
  | "skinbooster_juvelook"
  | "skinbooster_ha"
  | "sof_wave_200"
  | "sof_wave_300"
  | "stem_cell"
  | "thermage_600"
  | "thermage_900"
  | "toning"
  | "tune_face"
  | "tune_liner"
  | "ulthera_200"
  | "ulthera_400"
  | "ulthera_600"
  | "ulthera_800"
  | "v_beam";

// ─────────────────────────────────────────────────────────
// Basic Types
// ─────────────────────────────────────────────────────────
export type AreaId =
  | "full-face"
  | "forehead"
  | "eye-area"
  | "cheeks"
  | "jawline"
  | "neck"
  | "body"
  | "other"
  | "upper-face"    // 신규
  | "mid-face"      // 신규
  | "lower-face";   // 신규

export type PriorityId =
  | "price"
  | "effectiveness"
  | "pain"
  | "recoveryTime"
  | "reviews"
  | "location"
  | "minimal_downtime"  // 신규
  | "safety";           // 신규

export type BudgetId =
  // 구버전
  | "under-1000"
  | "1000-5000"
  | "5000-10000"
  | "10000-plus"
  | "no_limit"
  | "unsure"
  // 신규 (form-definition.ts 동기화)
  | "under-500"
  | "500-1500"
  | "1500-3000"
  | "3000-5000"
  | "5000-10000"
  | "10000-plus"
  | "flexible";

export type MedicalId =
  | "blood_clotting"
  | "pregnant"
  | "skin_allergy"
  | "immunosuppressants"
  | "skin_condition"
  | "antibiotics_or_steroids"
  | "keloid_tendency"  // 신규
  | "none"
  | "other";

export type PastId =
  // 구버전
  | "botox_4m"
  | "filler_2w"
  | "laser_2w"
  | "skinbooster_2w"
  | "stemcell_1m"
  | "stemcell_1_6m"
  | "stemcell_6m_plus"
  | "none"
  // 신규 (form-definition.ts 동기화)
  | "never"
  | "injectables_recent"
  | "injectables_past"
  | "laser_recent"
  | "laser_past"
  | "other_treatments"
  | "not_sure";

export type SkinTypeId = "dry" | "oily" | "combination" | "sensitive" | "normal" | "not_sure";

export type AgeGroup = "teens" | "20s" | "30s" | "40s" | "50s" | "60s" | "70_plus" | "60plus";

export type Gender = "male" | "female" | "non_binary" | "no_answer";

// ─────────────────────────────────────────────────────────
// Ethnicity (인종)
// ─────────────────────────────────────────────────────────
export type EthnicityId =
  | "asian"
  | "white"
  | "african"
  | "hispanic"
  | "middle_eastern"
  | "mixed"
  | "prefer_not_to_say";

export type Category = "laser" | "ultrasound" | "rf" | "injectable" | "other";

// ─────────────────────────────────────────────────────────
// Concern ID (form-definition.ts와 완전 동기화)
// ─────────────────────────────────────────────────────────
export type ConcernId =
  // ═══ TIER 1: Skin Conditions (신규 통합 ID) ═══
  | "acne"           // 통합
  | "pigmentation"   // 통합
  | "pores"
  | "redness"
  | "scars"          // 통합
  | "dryness"        // 신규

  // ═══ TIER 2: Anti-Aging (신규) ═══
  | "wrinkles"
  | "sagging"
  | "volume_loss"    // 신규

  // ═══ TIER 3: Contouring (신규) ═══
  | "jawline_enhancement"   // 신규
  | "nose_enhancement"      // 신규
  | "lip_enhancement"       // 신규
  | "double_chin"
  | "cheek_contouring"      // 신규
  | "forehead_contouring"   // 신규

  // ═══ 하위 호환성 (구버전 ID) ═══
  | "acne-inflammatory"
  | "acne-whiteheads"
  | "pigmentation-freckles"
  | "pigmentation-sun-damage"
  | "pigmentation-moles"
  | "pigmentation-melasma"
  | "pigmentation-lentigo"
  | "pigmentation-not-sure"
  | "scar-red"
  | "scar-brown"
  | "scar-rough"
  | "dryness_glow"          // 구버전
  | "volumizing"            // 구버전
  | "elasticity"            // 구버전
  | "doublie_chin"          // 오타
  | "uneven_tone"
  | "filler"                // 구버전 (deprecated)
  | "filler-forehead"
  | "filler-jawline"
  | "filler-cheeks"
  | "filler-under-eyes"
  | "filler-body"
  | "other";

// ─────────────────────────────────────────────────────────
// Treatment Goal (form-definition.ts와 동기화)
// ─────────────────────────────────────────────────────────
export type TreatmentGoalId =
  // 신규 (form-definition.ts)
  | "clear_skin"
  | "radiant_glow"
  | "texture_improvement"
  | "facial_contouring"
  | "anti_aging"
  | "recommendation"
  // 구버전 호환
  | "overall_refresh"
  | "lifting_firmness"
  | "texture_tone"
  | "acne_pore";

// ─────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────
export interface SelectedConcern {
  id: ConcernId;
  subOptions?: string[];
  tier?: 1 | 2 | 3 | 4;  // 신규
  category?: "skin_condition" | "anti_aging" | "contouring" | "other";  // 신규
}

export interface RecommendInputs {
  skinTypeId?: SkinTypeId;
  ageGroup?: AgeGroup;
  gender?: Gender;
  ethnicity?: EthnicityId;  // 인종별 가중치 조정용
  skinConcerns: SelectedConcern[];
  treatmentGoals: TreatmentGoalId[];
  treatmentAreas: AreaId[];
  budgetRangeId: BudgetId;
  priorityId: PriorityId;
  pastTreatments: PastId[];
  medicalConditions: MedicalId[];
}

export interface Candidate {
  key: TreatmentKey;
  importance: 1 | 2 | 3;
  why: string;
  tier?: 1 | 2 | 3;  // 신규
}

export interface TreatmentMeta {
  key: TreatmentKey;
  label: string;
  category: Category;
  pain: number;
  effectiveness: number;
  downtime: number;
  areas: AreaId[];
  createsWound?: boolean;
  isLaser?: boolean;
  isInjectable?: boolean;
  equivalenceGroup?:
    | "lifting"
    | "vascular"
    | "pigment"
    | "texture"
    | "hydration"
    | "volume"
    | "acne"
    | "scars"
    | "jawline"
    | "body";
}

export interface RecommendedItem {
  key: TreatmentKey;
  label: string;
  priceKRW: number;
  priceUSD: number;
  rationale: string[];
}

export interface ExcludedItem {
  key: TreatmentKey;
  label: string;
  reason: string;
}

export interface Substitution {
  from: TreatmentKey;
  to: TreatmentKey;
  reason: "price" | "pain" | "recoveryTime";
}

export interface RecommendationOutput {
  recommendations: RecommendedItem[];
  totalPriceKRW: number;
  totalPriceUSD: number;
  excluded: ExcludedItem[];
  substitutions: Substitution[];
  upgradeSuggestions: string[];
  notes: string[];
  ethnicityNote?: string;         // 인종별 안내 코멘트
  budgetRangeId?: BudgetId;      // 사용자가 설정한 예산
  budgetUpperLimit?: number;      // 예산의 상한값 (KRW)
}

export interface TierAnalysis {
  hasTier1: boolean;
  hasTier2: boolean;
  hasTier3: boolean;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
}
