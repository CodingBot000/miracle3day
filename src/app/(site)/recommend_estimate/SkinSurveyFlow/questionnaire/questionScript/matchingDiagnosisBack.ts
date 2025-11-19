/**
 * 문진표 기반 맞춤 시술 추천 엔진 (TypeScript)
 * - 입력: 문진 결과(피부 고민/목표/부위/예산/우선순위/최근 시술/의학적 상태 등) **+ 연령대, 성별**
 * - 출력: 추천 시술 목록(이유), 총 비용, 제외 시술(이유), 대체/업셀 제안
 *
 * ⚠️ 주의
 *  - 시술명은 영어 key를 그대로 사용합니다 (botox, ulthera_400 등).
 *  - 가격은 KRW 기준을 USD(환율 0.00072)로 변환합니다.
 *  - 임상적 안전성/정확도를 최대한 반영했으나, 실제 시술 결정은 반드시 전문의 상담을 거치세요.
 */

import { log } from "@/utils/logger";

 
// ========= 공통 상수/타입 =========

export const KRW_TO_USD = 0.00072 as const;

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

type AreaId =
  | "full-face"
  | "forehead"
  | "eye-area"
  | "cheeks"
  | "jawline"
  | "neck"
  | "body"
  | "other";

type PriorityId = "price" | "effectiveness" | "pain" | "recoveryTime" | "reviews" | "location";

type BudgetId =
  | "under-1000"
  | "1000-5000"
  | "5000-10000"
  | "10000-plus"
  | "no_limit"
  | "unsure";

type MedicalId =
  | "blood_clotting"
  | "pregnant"
  | "skin_allergy"
  | "immunosuppressants"
  | "skin_condition"
  | "antibiotics_or_steroids"
  | "none"
  | "other";

type PastId =
  | "botox_4m"
  | "filler_2w"
  | "laser_2w"
  | "skinbooster_2w"
  | "stemcell_1m"
  | "stemcell_1_6m"
  | "stemcell_6m_plus"
  | "none";

type SkinTypeId =
  | "dry"
  | "oily"
  | "combination"
  | "sensitive"
  | "normal"
  | "not_sure";

/** 연령대: 10대, 20대, ..., 70대 이상을 나타내는 범주형 타입 */
type AgeGroup = "teens" | "20s" | "30s" | "40s" | "50s" | "60s" | "70_plus";

/** 성별: 남성, 여성, 논바이너리, 혹은 무응답 */
type Gender = "male" | "female" | "non_binary" | "no_answer";

export interface SelectedConcern {
  id:
    // Acne
    | "acne-inflammatory"
    | "acne-whiteheads"
    // Basic concerns
    | "pores"
    | "redness"
    | "uneven_tone"
    | "sagging"
    | "elasticity"
    | "double_chin"
    | "volumizing"
    | "wrinkles"
    | "dryness_glow"
    // Pigmentation
    | "pigmentation-freckles"
    | "pigmentation-sun-damage"
    | "pigmentation-moles"
    | "pigmentation-melasma"
    | "pigmentation-lentigo"
    | "pigmentation-not-sure"
    // Scars
    | "scar-red"
    | "scar-brown"
    | "scar-rough"
    // Filler
    | "filler-forehead"
    | "filler-jawline"
    | "filler-cheeks"
    | "filler-under-eyes"
    | "filler-body"
    // Other
    | "other";
  subOptions?: string[]; // deprecated - kept for backward compatibility
}

export interface RecommendInputs {
  skinTypeId?: SkinTypeId;
  ageGroup?: AgeGroup;    // 추가: 사용자 연령대 (예: "teens", "20s", ..., "70_plus")
  gender?: Gender;        // 추가: 사용자 성별 (예: "male", "female", "non_binary", "no_answer")
  skinConcerns: SelectedConcern[];  // 복수 가능
  treatmentGoals: (
    | "overall_refresh"
    | "lifting_firmness"
    | "texture_tone"
    | "anti_aging"
    | "acne_pore"
    | "recommendation"
  )[];
  treatmentAreas: AreaId[];      // 복수 가능
  budgetRangeId: BudgetId;
  priorityId: PriorityId;        // 단일 최우선 고려 요소
  pastTreatments: PastId[];      // 복수 가능
  medicalConditions: MedicalId[]; // 복수 가능
}

export interface RecommendedItem {
  key: TreatmentKey;
  label: string;
  priceKRW: number;
  priceUSD: number;
  rationale: string[];  // 추천 이유 목록
}

export interface ExcludedItem {
  key: TreatmentKey;
  label: string;
  reason: string;  // 제외 사유
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
}

// ========= 원본 가격 테이블 =========

const PRICE_TABLE: Record<TreatmentKey, number> = {
  botox: 30000,
  capri: 150000,
  co2: 200000,
  density_600: 1800000,
  density_900: 2400000,
  exel_v: 70000,
  exosome: 450000,
  filler: 300000,
  genesis: 80000,
  gensis: 80000, // 오타 -> genesis 별칭
  inmode: 150000,
  juvegen: 150000,
  juvelook: 350000,
  liftera_200: 300000,
  liftera_400: 500000,
  liftera_600: 700000,
  liftera_800: 900000,
  neobeam: 80000,
  oligio_600: 890000,
  oligio_900: 1200000,
  onda: 600000,
  potenza: 400000,
  fraxel: 350000,
  repot_or_toning_and_genesis: 150000,
  scultra: 550000,
  secret: 400000,
  shrink_200: 200000,
  shrink_400: 350000,
  shrink_600: 500000,
  shrink_800: 650000,
  "skinbooster-rejuran": 250000,
  skinbooster_juvelook: 350000,
  skinbooster_ha: 240000,
  sof_wave_200: 400000,
  sof_wave_300: 550000,
  stem_cell: 600000,
  thermage_600: 2200000,
  thermage_900: 3000000,
  toning: 100000,
  tune_face: 700000,
  tune_liner: 300000,
  ulthera_200: 500000,
  ulthera_400: 2000000,
  ulthera_600: 2850000,
  ulthera_800: 3500000,
  v_beam: 93000,
};

// ========= 시술 메타데이터 (통증/효과/다운타임/카테고리/가능부위 등) =========

type Category =
  | "laser"
  | "ultrasound"    // HIFU/Sofwave 등
  | "rf"            // 고주파 (마이크로니들링 RF 포함)
  | "injectable"    // 주사형 (보톡스/필러/스킨부스터 등)
  | "other";

interface TreatmentMeta {
  key: TreatmentKey;
  label: string;
  category: Category;
  pain: number;           // 1 (매우 낮음) ~ 10 (매우 높음)
  effectiveness: number;  // 1 (낮음) ~ 10 (높음)
  downtime: number;       // 0 (없음) ~ 10 (김)
  areas: AreaId[];        // 적용 가능 부위
  createsWound?: boolean;
  isLaser?: boolean;
  isInjectable?: boolean;
  equivalenceGroup?: "lifting" | "vascular" | "pigment" | "texture" | "hydration" | "volume" | "acne" | "scars" | "jawline" | "body";
}

// 얼굴 공통 부위 상수
const FACE_AREAS: AreaId[] = ["full-face", "forehead", "eye-area", "cheeks", "jawline", "neck"];


// 메타 정의 (임상적 평균 체감 기준; 상대 비교에 유리하도록 설정)
const META: Record<TreatmentKey, TreatmentMeta> = {
  botox: {
    key: "botox",
    label: "botox",
    category: "injectable",
    pain: 2,
    effectiveness: 8,
    downtime: 1,
    areas: ["forehead", "eye-area", "jawline", "full-face"],
    isInjectable: true,
    equivalenceGroup: "texture",
  },
  capri: {
    key: "capri",
    label: "capri",
    category: "laser",
    pain: 2,
    effectiveness: 6,
    downtime: 0,
    areas: FACE_AREAS,
    isLaser: true,
    equivalenceGroup: "acne",
  },
  co2: {
    key: "co2",
    label: "co2",
    category: "laser",
    pain: 8,
    effectiveness: 9,
    downtime: 7,
    areas: FACE_AREAS,
    createsWound: true,
    isLaser: true,
    equivalenceGroup: "texture",
  },
  density_600: {
    key: "density_600",
    label: "density",
    category: "ultrasound",
    pain: 6,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  density_900: {
    key: "density_900",
    label: "density",
    category: "ultrasound",
    pain: 6,
    effectiveness: 9,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  exel_v: {
    key: "exel_v",
    label: "exel v",
    category: "laser",
    pain: 4,
    effectiveness: 7,
    downtime: 2, // 멍 가능
    areas: FACE_AREAS,
    isLaser: true,
    equivalenceGroup: "vascular",
  },
  exosome: {
    key: "exosome",
    label: "exosome",
    category: "injectable",
    pain: 3,
    effectiveness: 6,
    downtime: 1,
    areas: FACE_AREAS,
    isInjectable: true,
    equivalenceGroup: "hydration",
  },
  filler: {
    key: "filler",
    label: "filler",
    category: "injectable",
    pain: 3,
    effectiveness: 9,
    downtime: 2,
    areas: FACE_AREAS.concat(["body"]),
    isInjectable: true,
    equivalenceGroup: "volume",
  },
  genesis: {
    key: "genesis",
    label: "genesis",
    category: "laser",
    pain: 2,
    effectiveness: 6,
    downtime: 0,
    areas: FACE_AREAS,
    isLaser: true,
    equivalenceGroup: "texture",
  },
  gensis: {
    key: "gensis",
    label: "gensis",
    category: "laser",
    pain: 2,
    effectiveness: 6,
    downtime: 0,
    areas: FACE_AREAS,
    isLaser: true,
    equivalenceGroup: "texture",
  },
  inmode: {
    key: "inmode",
    label: "inmode",
    category: "rf",
    pain: 4,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS.concat(["body"]),
    equivalenceGroup: "lifting",
  },
  juvegen: {
    key: "juvegen",
    label: "juvegen",
    category: "injectable",
    pain: 3,
    effectiveness: 6,
    downtime: 1,
    areas: FACE_AREAS,
    isInjectable: true,
    equivalenceGroup: "hydration",
  },
  juvelook: {
    key: "juvelook",
    label: "juvelook",
    category: "injectable",
    pain: 4,
    effectiveness: 7,
    downtime: 2,
    areas: FACE_AREAS,
    isInjectable: true,
    equivalenceGroup: "scars",
  },
  liftera_200: {
    key: "liftera_200",
    label: "liftera",
    category: "ultrasound",
    pain: 5,
    effectiveness: 6,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  liftera_400: {
    key: "liftera_400",
    label: "liftera",
    category: "ultrasound",
    pain: 5,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  liftera_600: {
    key: "liftera_600",
    label: "liftera",
    category: "ultrasound",
    pain: 5,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  liftera_800: {
    key: "liftera_800",
    label: "liftera",
    category: "ultrasound",
    pain: 5,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  neobeam: {
    key: "neobeam",
    label: "neobeam",
    category: "laser",
    pain: 2,
    effectiveness: 6,
    downtime: 0,
    areas: FACE_AREAS,
    isLaser: true,
    equivalenceGroup: "texture",
  },
  oligio_600: {
    key: "oligio_600",
    label: "oligio",
    category: "rf",
    pain: 5,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  oligio_900: {
    key: "oligio_900",
    label: "oligio",
    category: "rf",
    pain: 5,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  onda: {
    key: "onda",
    label: "onda",
    category: "rf",
    pain: 4,
    effectiveness: 7,
    downtime: 1,
    areas: ["body", "jawline"],
    equivalenceGroup: "body",
  },
  potenza: {
    key: "potenza",
    label: "potenza",
    category: "rf",
    pain: 6,
    effectiveness: 8,
    downtime: 4,
    areas: FACE_AREAS,
    createsWound: true,
    equivalenceGroup: "texture",
  },
  fraxel: {
    key: "fraxel",
    label: "fraxel",
    category: "laser",
    pain: 6,
    effectiveness: 8,
    downtime: 6,
    areas: FACE_AREAS,
    createsWound: true,
    isLaser: true,
    equivalenceGroup: "texture",
  },
  repot_or_toning_and_genesis: {
    key: "repot_or_toning_and_genesis",
    label: "repot or toning&genesis",
    category: "laser",
    pain: 2,
    effectiveness: 5,
    downtime: 0,
    areas: FACE_AREAS,
    isLaser: true,
    equivalenceGroup: "texture",
  },
  scultra: {
    key: "scultra",
    label: "scultra",
    category: "injectable",
    pain: 4,
    effectiveness: 8,
    downtime: 2,
    areas: FACE_AREAS,
    isInjectable: true,
    equivalenceGroup: "volume",
  },
  secret: {
    key: "secret",
    label: "secret",
    category: "rf",
    pain: 6,
    effectiveness: 8,
    downtime: 4,
    areas: FACE_AREAS,
    createsWound: true,
    equivalenceGroup: "texture",
  },
  shrink_200: {
    key: "shrink_200",
    label: "shrink",
    category: "ultrasound",
    pain: 5,
    effectiveness: 5,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  shrink_400: {
    key: "shrink_400",
    label: "shrink",
    category: "ultrasound",
    pain: 5,
    effectiveness: 6,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  shrink_600: {
    key: "shrink_600",
    label: "shrink",
    category: "ultrasound",
    pain: 5,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  shrink_800: {
    key: "shrink_800",
    label: "shrink",
    category: "ultrasound",
    pain: 5,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  "skinbooster-rejuran": {
    key: "skinbooster-rejuran",
    label: "skinbooster rejuran",
    category: "injectable",
    pain: 4,
    effectiveness: 7,
    downtime: 2,
    areas: FACE_AREAS,
    isInjectable: true,
    equivalenceGroup: "hydration",
  },
  skinbooster_juvelook: {
    key: "skinbooster_juvelook",
    label: "skinbooster juvelook",
    category: "injectable",
    pain: 4,
    effectiveness: 7,
    downtime: 2,
    areas: FACE_AREAS,
    isInjectable: true,
    equivalenceGroup: "hydration",
  },
  skinbooster_ha: {
    key: "skinbooster_ha",
    label: "skinbooster ha",
    category: "injectable",
    pain: 4,
    effectiveness: 6,
    downtime: 2,
    areas: FACE_AREAS,
    isInjectable: true,
    equivalenceGroup: "hydration",
  },
  sof_wave_200: {
    key: "sof_wave_200",
    label: "sof wave",
    category: "ultrasound",
    pain: 4,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  sof_wave_300: {
    key: "sof_wave_300",
    label: "sof wave",
    category: "ultrasound",
    pain: 4,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting",
  },
  stem_cell: {
    key: "stem_cell",
    label: "stem cell",
    category: "injectable",
    pain: 4,
    effectiveness: 7,
    downtime: 2,
    areas: FACE_AREAS,
    isInjectable: true,
    equivalenceGroup: "hydration",
  },
  thermage_600: {
    key: "thermage_600",
    label: "thermage",
    category: "rf",
    pain: 5,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS.concat(["body"]),
    equivalenceGroup: "lifting",
  },
  thermage_900: {
    key: "thermage_900",
    label: "thermage",
    category: "rf",
    pain: 5,
    effectiveness: 9,
    downtime: 1,
    areas: FACE_AREAS.concat(["body"]),
    equivalenceGroup: "lifting",
  },
  toning: {
    key: "toning",
    label: "toning",
    category: "laser",
    pain: 2,
    effectiveness: 6,
    downtime: 0,
    areas: FACE_AREAS,
    isLaser: true,
    equivalenceGroup: "pigment",
  },
  tune_face: {
    key: "tune_face",
    label: "tune face",
    category: "rf",
    pain: 5,
    effectiveness: 7,
    downtime: 1,
    areas: ["jawline", "full-face"],
    equivalenceGroup: "jawline",
  },
  tune_liner: {
    key: "tune_liner",
    label: "tune liner",
    category: "injectable", // 지방분해 주사 성격 가정
    pain: 4,
    effectiveness: 7,
    downtime: 2,
    areas: ["jawline"],
    isInjectable: true,
    equivalenceGroup: "jawline",
  },
  ulthera_200: {
    key: "ulthera_200",
    label: "ulthera",
    category: "ultrasound",
    pain: 7,
    effectiveness: 7,
    downtime: 1,
    areas: ["jawline", "neck", "full-face", "forehead", "cheeks"],
    equivalenceGroup: "lifting",
  },
  ulthera_400: {
    key: "ulthera_400",
    label: "ulthera",
    category: "ultrasound",
    pain: 7,
    effectiveness: 9,
    downtime: 1,
    areas: ["jawline", "neck", "full-face", "forehead", "cheeks"],
    equivalenceGroup: "lifting",
  },
  ulthera_600: {
    key: "ulthera_600",
    label: "ulthera",
    category: "ultrasound",
    pain: 7,
    effectiveness: 9,
    downtime: 1,
    areas: ["jawline", "neck", "full-face", "forehead", "cheeks"],
    equivalenceGroup: "lifting",
  },
  ulthera_800: {
    key: "ulthera_800",
    label: "ulthera",
    category: "ultrasound",
    pain: 7,
    effectiveness: 10,
    downtime: 1,
    areas: ["jawline", "neck", "full-face", "forehead", "cheeks"],
    equivalenceGroup: "lifting",
  },
  v_beam: {
    key: "v_beam",
    label: "v beam",
    category: "laser",
    pain: 4,
    effectiveness: 7,
    downtime: 2, // 멍 가능
    areas: FACE_AREAS,
    isLaser: true,
    equivalenceGroup: "vascular",
  },
};

// ========= 유틸 함수 =========

const formatUSD = (usd: number) => `$${usd.toLocaleString("en-US")}`;
const formatKRW = (krw: number) => `${krw.toLocaleString("ko-KR")}원`;

// 동일/유사 목적군 대체 후보 우선순위 (왼쪽이 더 "효과적/고가/고통" 경향)
const LIFTING_ORDER: TreatmentKey[] = [
  "ulthera_800",
  "ulthera_600",
  "ulthera_400",
  "thermage_900",
  "thermage_600",
  "sof_wave_300",
  "sof_wave_200",
  "density_900",
  "density_600",
  "liftera_800",
  "liftera_600",
  "liftera_400",
  "liftera_200",
  "shrink_800",
  "shrink_600",
  "shrink_400",
  "shrink_200",
  "inmode",
];

const TEXTURE_STRONG: TreatmentKey[] = ["co2", "fraxel", "potenza", "secret"];
const TEXTURE_GENTLE: TreatmentKey[] = [
  "genesis",
  "neobeam",
  "repot_or_toning_and_genesis",
];

const VASCULAR_ORDER: TreatmentKey[] = ["v_beam", "exel_v", "genesis"];
const PIGMENT_ORDER: TreatmentKey[] = ["toning", "genesis"];
const HYDRATION_ORDER: TreatmentKey[] = [
  "skinbooster-rejuran",
  "skinbooster_juvelook",
  "skinbooster_ha",
  "exosome",
  "stem_cell",
];
const VOLUME_ORDER: TreatmentKey[] = ["filler", "scultra"];
const ACNE_ORDER: TreatmentKey[] = ["capri", "genesis", "v_beam"];
const SCAR_ORDER: TreatmentKey[] = ["fraxel", "secret", "potenza", "juvelook"];

function isLaser(t: TreatmentKey) {
  return META[t].category === "laser" || !!META[t].isLaser;
}
function isInjectable(t: TreatmentKey) {
  return META[t].category === "injectable" || !!META[t].isInjectable;
}
function createsWound(t: TreatmentKey) {
  return !!META[t].createsWound;
}
function inAreas(t: TreatmentKey, selected: AreaId[]) {
  if (selected.length === 0) return true;
  // full-face 선택 시 얼굴 범주면 통과
  if (selected.includes("full-face")) {
    return META[t].areas.some((a) => FACE_AREAS.includes(a));
  }
  return META[t].areas.some((a) => selected.includes(a));
}



// ========= 기본 매핑: 고민/목표 -> 시술 후보 =========

/** 각 아이템은 [시술키, 중요도] 형태.
 *  - 중요도 1: 핵심 (가능하면 유지)
 *  - 중요도 2: 보조 (상황 봐서 조정)
 *  - 중요도 3: 옵션 (예산/우선순위에 따라 제외되기 쉬움)
 */
type Candidate = { key: TreatmentKey; importance: 1 | 2 | 3; why: string };

function addUnique(cands: Candidate[], add: Candidate[]) {
  add.forEach((c) => {
    if (!cands.find((x) => x.key === c.key)) {
      cands.push(c);
    }
  });
}

function baseCandidatesByConcern(c: SelectedConcern): Candidate[] {
  const { id } = c;
  const out: Candidate[] = [];

  log.debug("MATCHING LOG: 피부 고민 분석 -", id);

  switch (id) {
    case "acne-inflammatory": {
      addUnique(out, [
        { key: "capri", importance: 1, why: "Acne (inflammatory) reduction" },
        { key: "genesis", importance: 2, why: "Sebum/redness support" },
        { key: "secret", importance: 2, why: "Acne scars/texture (micro-RF)" },
        { key: "potenza", importance: 2, why: "Acne scars/texture (RF)" },
        { key: "fraxel", importance: 3, why: "Scar laser (with downtime)" },
      ]);
      break;
    }
    case "acne-whiteheads": {
      addUnique(out, [
        { key: "genesis", importance: 1, why: "Comedone/sebum control" },
        { key: "capri", importance: 2, why: "Acne support" },
        { key: "secret", importance: 2, why: "Acne scars/texture (micro-RF)" },
        { key: "potenza", importance: 2, why: "Acne scars/texture (RF)" },
        { key: "fraxel", importance: 3, why: "Scar laser (with downtime)" },
      ]);
      break;
    }
    case "pores": {
      addUnique(out, [
        { key: "genesis", importance: 1, why: "Pores/texture" },
        { key: "secret", importance: 2, why: "Pores (micro-RF)" },
        { key: "potenza", importance: 2, why: "Pores (RF)" },
      ]);
      break;
    }
    case "redness": {
      addUnique(out, [
        { key: "v_beam", importance: 1, why: "Vascular/redness" },
        { key: "exel_v", importance: 2, why: "Vascular support" },
        { key: "genesis", importance: 2, why: "Soothing/redness" },
      ]);
      break;
    }
    case "uneven_tone": {
      addUnique(out, [
        { key: "toning", importance: 1, why: "Tone improvement" },
        { key: "genesis", importance: 1, why: "Tone refinement" },
        { key: "repot_or_toning_and_genesis", importance: 2, why: "Overall tone-up" },
      ]);
      break;
    }
    case "sagging": {
      addUnique(out, [
        { key: "ulthera_400", importance: 1, why: "Lifting" },
        { key: "thermage_600", importance: 1, why: "Elasticity" },
        { key: "liftera_400", importance: 2, why: "Cost-effective lifting" },
        { key: "sof_wave_300", importance: 2, why: "Sofwave lifting" },
      ]);
      break;
    }
    case "elasticity": {
      addUnique(out, [
        { key: "thermage_600", importance: 1, why: "Elasticity improvement" },
        { key: "ulthera_400", importance: 1, why: "Lifting/elasticity" },
        { key: "oligio_600", importance: 2, why: "RF elasticity" },
        { key: "scultra", importance: 2, why: "Collagen production" },
      ]);
      break;
    }
    case "double_chin": {
      addUnique(out, [
        { key: "tune_liner", importance: 1, why: "Double chin improvement" },
        { key: "tune_face", importance: 1, why: "Jawline definition" },
        { key: "ulthera_200", importance: 2, why: "Jawline lifting" },
      ]);
      break;
    }
    case "volumizing": {
      addUnique(out, [
        { key: "filler", importance: 1, why: "Volume enhancement" },
        { key: "scultra", importance: 2, why: "Natural volume" },
      ]);
      break;
    }
    case "wrinkles": {
      addUnique(out, [
        { key: "botox", importance: 1, why: "Expression lines" },
        { key: "filler", importance: 1, why: "Wrinkle filling" },
        { key: "fraxel", importance: 2, why: "Fine lines improvement" },
        { key: "ulthera_400", importance: 2, why: "Wrinkle improvement via lifting" },
      ]);
      break;
    }
    case "dryness_glow": {
      addUnique(out, [
        { key: "skinbooster_ha", importance: 1, why: "Hydration/glow" },
        { key: "skinbooster-rejuran", importance: 1, why: "Regeneration/hydration" },
        { key: "exosome", importance: 2, why: "Regeneration/glow" },
        { key: "stem_cell", importance: 2, why: "Regeneration" },
      ]);
      break;
    }
    // Pigmentation cases
    case "pigmentation-freckles":
    case "pigmentation-sun-damage":
    case "pigmentation-melasma":
    case "pigmentation-lentigo":
    case "pigmentation-not-sure": {
      addUnique(out, [
        { key: "toning", importance: 1, why: "Pigmentation improvement" },
        { key: "genesis", importance: 2, why: "Pigmentation/tone refinement" },
        { key: "repot_or_toning_and_genesis", importance: 2, why: "Pigmentation package" },
      ]);
      break;
    }
    // Scar cases
    case "scar-red":
    case "scar-brown":
    case "scar-rough": {
      addUnique(out, [
        { key: "fraxel", importance: 1, why: "Scar improvement" },
        { key: "secret", importance: 1, why: "Scars (micro-RF)" },
        { key: "potenza", importance: 2, why: "Scars (RF)" },
        { key: "juvelook", importance: 2, why: "Scars/regeneration" },
      ]);
      break;
    }
    // Filler specific areas
    case "filler-forehead":
    case "filler-jawline":
    case "filler-cheeks":
    case "filler-under-eyes":
    case "filler-body": {
      addUnique(out, [
        { key: "filler", importance: 1, why: "Volume/contour improvement" },
        { key: "scultra", importance: 2, why: "Natural volume" },
      ]);
      break;
    }
    case "other":
    default: {
      // Default recommendation: overall improvement
      addUnique(out, [
        { key: "repot_or_toning_and_genesis", importance: 1, why: "Overall improvement" },
        { key: "skinbooster_ha", importance: 2, why: "Basic care" },
      ]);
      break;
    }
  }

  log.debug("MATCHING LOG: 고민별 후보 -", id, "->", out.map(c => c.key));
  return out;
}

function baseCandidatesByGoal(goal: RecommendInputs["treatmentGoals"][number]): Candidate[] {
  const out: Candidate[] = [];
  log.debug("MATCHING LOG: 목표 분석 -", goal);
  switch (goal) {
    case "overall_refresh":
      addUnique(out, [
        { key: "repot_or_toning_and_genesis", importance: 1, why: "Overall tone/texture improvement" },
        { key: "skinbooster_ha", importance: 2, why: "Hydration/glow" },
      ]);
      break;
    case "lifting_firmness":
      addUnique(out, [
        { key: "ulthera_400", importance: 1, why: "Lifting" },
        { key: "thermage_600", importance: 1, why: "Elasticity" },
        { key: "liftera_400", importance: 2, why: "Cost-effective lifting" },
        { key: "scultra", importance: 2, why: "Collagen" },
      ]);
      break;
    case "texture_tone":
      addUnique(out, [
        { key: "genesis", importance: 1, why: "Texture/tone" },
        { key: "toning", importance: 1, why: "Tone/pigmentation" },
        { key: "fraxel", importance: 2, why: "Texture/fine lines" },
      ]);
      break;
    case "anti_aging":
      addUnique(out, [
        { key: "botox", importance: 1, why: "Expression lines" },
        { key: "ulthera_400", importance: 1, why: "Lifting" },
        { key: "skinbooster-rejuran", importance: 2, why: "Regeneration/hydration" },
      ]);
      break;
    case "acne_pore":
      addUnique(out, [
        { key: "capri", importance: 1, why: "Acne" },
        { key: "genesis", importance: 1, why: "Pores/texture" },
        { key: "potenza", importance: 2, why: "Scars/texture" },
      ]);
      break;
    case "recommendation":
      addUnique(out, [
        { key: "repot_or_toning_and_genesis", importance: 1, why: "Overall improvement package" },
        { key: "skinbooster_ha", importance: 2, why: "Hydration/glow" },
      ]);
      break;
  }
  log.debug("MATCHING LOG: 목표별 후보 -", goal, "->", out.map(c => c.key));
  return out;
}

// ========= 연령대/성별 기반 가중치 조정 함수 =========

/** 연령대별 선호 시술 목록: 각 연령대에서 효과가 높거나 선호되는 시술 키들 */
const AGE_PREFERRED_TREATMENTS: Record<AgeGroup, TreatmentKey[]> = {
  teens: ["toning", "capri", "v_beam"],                      // 10대: 색소/여드름 위주
  "20s": ["genesis", "exosome", "skinbooster-rejuran", "skinbooster_ha", "skinbooster_juvelook"],  // 20대: 모공/피부결 개선, 재생/광채
  "30s": ["skinbooster-rejuran", "skinbooster_ha", "skinbooster_juvelook", "liftera_400", "juvelook"], // 30대: 콜라겐/탄력 예방 (스킨부스터, 리프팅 경미, 주베룩)
  "40s": ["ulthera_400", "thermage_600", "filler"],          // 40대: 리프팅/탄력/볼륨
  "50s": ["ulthera_400", "thermage_600", "filler"],          // 50대: (40대와 유사)
  "60s": ["ulthera_600", "ulthera_800", "thermage_900"],     // 60대: 고강도 리프팅 (HIFU/RF)
  "70_plus": ["ulthera_600", "ulthera_800", "thermage_900"]  // 70대 이상: 60대와 유사 (최대 강도 리프팅)
};

/** 성별별 선호 시술 목록: 남성/여성에서 효과적으로 여겨지는 시술 키들 */
const GENDER_PREFERRED_TREATMENTS: Record<Gender, TreatmentKey[]> = {
  male: ["capri", "genesis", "secret", "potenza", "filler", "scultra"],    // 남성: 피지/모공 관리 + 볼륨 보충
  female: ["ulthera_400", "thermage_600", "liftera_400", "toning", "skinbooster-rejuran", "skinbooster_ha", "exosome"], // 여성: 리프팅/탄력 + 광채
  non_binary: [],  // 논바이너리: 특별 가중치 없음 (중성적 로직 적용)
  no_answer: []    // 무응답: 특별 가중치 없음
};

/**
 * 주어진 후보 리스트에서 해당 연령대에 맞는 시술의 중요도를 상향 조정한다.
 * - 연령대별로 선호되는 시술들은 importance를 1로 올리고, rationale에 표시를 붙인다.
 */
function adjustCandidatesByAgeGroup(cands: Candidate[], ageGroup: AgeGroup): Candidate[] {
  const preferredKeys = new Set<TreatmentKey>(AGE_PREFERRED_TREATMENTS[ageGroup] || []);
  // Age group labels
  const ageLabelMap: Record<AgeGroup, string> = {
    teens: "teens",
    "20s": "20s",
    "30s": "30s",
    "40s": "40s",
    "50s": "50s",
    "60s": "60s",
    "70_plus": "70+ age group"
  };
  return cands.map((c) => {
    if (preferredKeys.has(c.key)) {
      // 중요도 높이기: 우선 적용 (효과가 높다고 판단)
      const newImportance: 1 | 2 | 3 = 1;
      const ageLabel = ageLabelMap[ageGroup] || "target age";
      const newWhy = `${c.why} (${ageLabel} recommended)`;  // Add age group recommendation to description
      return { ...c, importance: newImportance, why: newWhy };
    }
    return c;
  });
}

/**
 * 주어진 후보 리스트에서 성별 특성에 맞는 시술의 중요도를 조정한다.
 * - 남성/여성에 특화된 선호 시술들은 importance를 1로 올리고, rationale에 표시를 붙인다.
 * - 논바이너리 또는 무응답의 경우 가중치 조정 없음 (중립 처리).
 */
function adjustCandidatesByGender(cands: Candidate[], gender: Gender): Candidate[] {
  const preferredKeys = new Set<TreatmentKey>(GENDER_PREFERRED_TREATMENTS[gender] || []);
  return cands.map((c) => {
    if (preferredKeys.has(c.key)) {
      // Non-binary나 no_answer의 경우 preferredKeys가 빈 세트이므로 아무 변화 없음
      const newImportance: 1 | 2 | 3 = 1;
      let genderNote = "";
      if (gender === "male") genderNote = "male recommended";
      else if (gender === "female") genderNote = "female recommended";
      else genderNote = "";  // non_binary or no_answer: no note
      const newWhy = genderNote ? `${c.why} (${genderNote})` : c.why;
      return { ...c, importance: newImportance, why: newWhy };
    }
    return c;
  });
}

// ========= 우선순위 기반 치환/제거 규칙 =========

function substituteForPriority(
  list: Candidate[],
  priority: PriorityId,
  substitutions: Substitution[],
  excluded: ExcludedItem[]
): Candidate[] {
  let arr = [...list];
  const has = (k: TreatmentKey) => arr.find((c) => c.key === k);
  const replace = (from: TreatmentKey, to: TreatmentKey, reason: Substitution["reason"]) => {
    const idx = arr.findIndex((c) => c.key === from);
    if (idx >= 0 && !has(to)) {
      const base = arr[idx];
      arr.splice(idx, 1, { ...base, key: to, why: `${base.why} → 대체(${reason})` });
      substitutions.push({ from, to, reason });
    } else if (idx >= 0 && has(to)) {
      // 중복 방지: from 제거만
      const base = arr[idx];
      arr.splice(idx, 1);
      excluded.push({
        key: from,
        label: META[from].label,
        reason: `Duplicate purpose → maintaining ${to}`,
      });
    }
  };

  if (priority === "price") {
    // 고가 HIFU/RF 리프팅 장비 → 가성비 장비로 치환
    if (has("ulthera_800")) replace("ulthera_800", "liftera_800", "price");
    if (has("ulthera_600")) replace("ulthera_600", "liftera_600", "price");
    if (has("ulthera_400")) replace("ulthera_400", "liftera_400", "price");
    if (has("thermage_900")) replace("thermage_900", "sof_wave_300", "price");
    if (has("thermage_600")) replace("thermage_600", "sof_wave_200", "price");
    // 텍스처 개선: 다운타임/고비용 레이저 → 저비용 레이저로
    ["co2", "fraxel"].forEach((t) => {
      if (has(t as TreatmentKey)) replace(t as TreatmentKey, "genesis", "price");
    });
  }

  if (priority === "pain") {
    // 통증 높은 HIFU → 통증 낮은 장비로 (sof_wave 또는 가온 리프팅)
    ["ulthera_800", "ulthera_600", "ulthera_400", "ulthera_200"].forEach((t) => {
      if (has(t as TreatmentKey)) replace(t as TreatmentKey, "sof_wave_300", "pain");
    });
    // 통증 큰 레이저/마이크로니들 RF → 저통증 레이저로
    ["co2", "fraxel", "secret", "potenza"].forEach((t) => {
      if (has(t as TreatmentKey)) replace(t as TreatmentKey, "genesis", "pain");
    });
  }

  if (priority === "recoveryTime") {
    // 다운타임 큰 시술 직접 제외 또는 치환
    ["co2", "fraxel"].forEach((t) => {
      const idx = arr.findIndex((c) => c.key === (t as TreatmentKey));
      if (idx >= 0) {
        excluded.push({
          key: t as TreatmentKey,
          label: META[t as TreatmentKey].label,
          reason: "Excluded due to downtime priority",
        });
        arr.splice(idx, 1);
        // 대체 시술 추가
        if (!has("genesis")) {
          arr.push({ key: "genesis", importance: 2, why: "Minimal downtime alternative" });
        }
      }
    });
  }

  // (priority === "reviews" 또는 "location"인 경우 별도 로직 없음)
  return arr;
}

// ========= 예산 상한 계산 함수 =========
function budgetUpperKRW(budgetId: BudgetId): number {
  switch (budgetId) {
    case "under-1000":
      return Math.floor(1000 / KRW_TO_USD);
    case "1000-5000":
      return Math.floor(5000 / KRW_TO_USD);
    case "5000-10000":
      return Math.floor(10000 / KRW_TO_USD);
    case "10000-plus":
    case "no_limit":
    case "unsure":
      return Number.POSITIVE_INFINITY;
  }
}

// ========= 예산 적용 함수 (후보 중 예산 초과 시술 제외/치환) =========
function enforceBudget(
  list: Candidate[],
  budgetUpper: number,
  substitutions: Substitution[],
  excluded: ExcludedItem[],
  priority: PriorityId
): Candidate[] {
  let arr = [...list];
  const sumKRW = (arr: Candidate[]) => arr.reduce((sum, c) => sum + PRICE_TABLE[c.key], 0);

  // 예산 초과 시 중요도 3부터 제외 (순차적으로 중요도 낮은 것부터 제외)
  let total = sumKRW(arr);
  for (const c of [...arr].sort((a, b) => b.importance - a.importance)) {
    if (total <= budgetUpper) break;
    if (c.importance > 1) {
      arr = arr.filter((x) => x.key !== c.key);
      excluded.push({
        key: c.key,
        label: META[c.key].label,
        reason: `Removed due to budget constraints (importance ${c.importance})`,
      });
      total = sumKRW(arr);
    }
  }

  // 예산 초과로 core treatment(importance 1)도 못 넣는 상황이면, 치환 로직 적용
  if (total > budgetUpper) {
    // (상세 구현 생략 – 대체 로직은 필요시 수행)
    // ...
  }

  return arr;
}

// ========= 최근 시술 필터 =========
function applyPastFilters(list: Candidate[], past: PastId[], excluded: ExcludedItem[]): Candidate[] {
  let out = [...list];
  if (past.includes("botox_4m")) {
    // 최근 4개월 이내 보톡스 → 보톡스 후보 제외
    out = out.filter((c) => c.key !== "botox");
    excluded.push({ key: "botox", label: META["botox"].label, reason: "최근 4개월 내 보톡스 시술" });
  }
  if (past.includes("filler_2w")) {
    // 최근 2주 이내 필러 → 필러 후보 제외
    out = out.filter((c) => c.key !== "filler");
    excluded.push({ key: "filler", label: META["filler"].label, reason: "최근 2주 내 필러 시술" });
  }
  if (past.includes("laser_2w")) {
    // 최근 2주 이내 레이저 → 레이저 시술들 제외
    const lasers = out.filter((c) => c.key && META[c.key]?.isLaser);
    if (lasers.length) {
      out = out.filter((c) => !META[c.key]?.isLaser);
      lasers.forEach((c) =>
        excluded.push({
          key: c.key,
          label: META[c.key].label,
          reason: "최근 2주 내 레이저 시술",
        })
      );
    }
  }
  if (past.includes("skinbooster_2w")) {
    // 최근 2주 이내 스킨부스터 → 스킨부스터 계열 제외
    const boosters = out.filter((c) => c.key.startsWith("skinbooster"));
    if (boosters.length) {
      out = out.filter((c) => !c.key.startsWith("skinbooster"));
      boosters.forEach((c) =>
        excluded.push({
          key: c.key,
          label: META[c.key].label,
          reason: "최근 2주 내 스킨부스터 시술",
        })
      );
    }
  }
  // ... (stem_cell cases etc.)
  return out;
}

// ========= 의학적 상태 필터 =========
function applyMedicalFilters(list: Candidate[], medicals: MedicalId[], excluded: ExcludedItem[]): Candidate[] {
  let out = [...list];
  // 임신 중이면: 시술을 강제 제외하진 않지만 주사/고강도 레이저는 비권장 (notes로 처리)
  // 면역억제제 복용 등도 notes 참고, 특정 시술 제외는 생략
  // (필요 시 확장)
  return out;
}

// ========= 최종 추천 리스트 변환 + 가격 합계 =========
function toRecommendedItems(cands: Candidate[]): RecommendedItem[] {
  return cands.map((c) => {
    const krw = PRICE_TABLE[c.key];
    return {
      key: c.key,
      label: META[c.key].label,
      priceKRW: krw,
      priceUSD: krwToUsd(krw),
      rationale: [c.why]
    };
  });
}



function filterByArea(cands: Candidate[], areas: AreaId[], excluded: ExcludedItem[]): Candidate[] {
  const out: Candidate[] = [];
  for (const c of cands) {
    if (inAreas(c.key, areas)) {
      out.push(c);
    } else {
      excluded.push({
        key: c.key,
        label: META[c.key].label,
        reason: `Incompatible with selected areas`,
      });
    }
  }
  return out;
}
// ========= 업셀/대안 제안 메시지 구성 =========

function buildUpgradeSuggestions(
  excluded: ExcludedItem[],
  subs: Substitution[],
  priority: PriorityId,
  budgetUpper: number,
): string[] {
  const msgs: string[] = [];

  // 가격 대체 발생
  subs
    .filter((s) => s.reason === "price")
    .forEach((s) => {
      msgs.push(
        `Consider **${META[s.from].label}** if budget allows. Currently substituted with **${META[s.to].label}**.`,
      );
    });

  // 통증/다운타임으로 제외/치환
  if (priority === "pain") {
    const painDrops = excluded.filter((e) =>
      /통증|pain|치환/.test(e.reason),
    );
    if (painDrops.length > 0) {
      msgs.push(
        `If pain is a concern, **strong local anesthesia/sedation therapy** can broaden your options. Examples: ${painDrops
          .slice(0, 3)
          .map((e) => META[e.key].label)
          .join(", ")}.`,
      );
    }
  }

  if (priority === "recoveryTime") {
    const dtDrops = excluded.filter((e) => /다운타임/.test(e.reason));
    if (dtDrops.length > 0) {
      msgs.push(
        `If you can accept some downtime, **1-2 high-intensity treatments** (e.g., ${dtDrops
          .slice(0, 3)
          .map((e) => META[e.key].label)
          .join(", ")}) can provide rapid improvement.`,
      );
    }
  }

  // 예산 초과로 빠진 핵심들
  const budgetDrops = excluded.filter((e) => /예산 초과/.test(e.reason));
  if (budgetDrops.length > 0 && Number.isFinite(budgetUpper)) {
    msgs.push(
      `A slight budget increase could include excluded treatments (e.g., ${budgetDrops
        .slice(0, 3)
        .map((e) => META[e.key].label)
        .join(", ")}) to **maximize effectiveness**.`,
    );
  }

  return msgs;
}

// ========= 통화 환율 변환 헬퍼 =========
function krwToUsd(krw: number): number {
  return Math.round(krw * KRW_TO_USD);
}

// ========= 메인 진입 함수 =========

export function recommendTreatments(input: RecommendInputs): RecommendationOutput {
  log.debug("MATCHING LOG: !!!! recommendTreatments 함수 호출됨 !!!!");
  log.debug("MATCHING LOG: 입력 받은 데이터:", JSON.stringify(input, null, 2));
  
  const {
    skinTypeId,
    ageGroup,
    gender,
    skinConcerns,
    treatmentGoals,
    treatmentAreas,
    budgetRangeId,
    priorityId,
    pastTreatments,
    medicalConditions,
  } = input;

  // === MATCHING LOG: 시작 ===
  log.debug("MATCHING LOG: =======================================================");
  log.debug("MATCHING LOG: 입력 데이터 분석 시작");
  log.debug("MATCHING LOG: 피부 타입:", skinTypeId);
  log.debug("MATCHING LOG: 연령대:", ageGroup);  
  log.debug("MATCHING LOG: 성별:", gender);
  log.debug("MATCHING LOG: 피부 고민:", skinConcerns);
  log.debug("MATCHING LOG: 시술 목표:", treatmentGoals);
  log.debug("MATCHING LOG: 시술 부위:", treatmentAreas);
  log.debug("MATCHING LOG: 예산 범위:", budgetRangeId);
  log.debug("MATCHING LOG: 우선순위:", priorityId);
  log.debug("MATCHING LOG: 최근 시술:", pastTreatments);
  log.debug("MATCHING LOG: 의학적 상태:", medicalConditions);

  const excluded: ExcludedItem[] = [];
  const substitutions: Substitution[] = [];
  const notes: string[] = [];

  // 0) 입력 정규화: gensis → genesis (오타 보정)
  // (선택지에는 gensis가 없지만 안전장치, META/PRICE에 gensis 정의됨)

  // 1) 기본 후보 수집
  log.debug("MATCHING LOG: ======== 1단계: 기본 후보 수집 ========");
  let candidates: Candidate[] = [];
  skinConcerns.forEach((c) => {
    log.debug("MATCHING LOG: 고민 처리 중:", c);
    addUnique(candidates, baseCandidatesByConcern(c));
  });
  treatmentGoals.forEach((g) => {
    log.debug("MATCHING LOG: 목표 처리 중:", g);
    addUnique(candidates, baseCandidatesByGoal(g));
  });
  log.debug("MATCHING LOG: 1단계 후 총 후보 수:", candidates.length);
  log.debug("MATCHING LOG: 1단계 후보 목록:", candidates.map(c => `${c.key}(중요도:${c.importance})`));

  // 1.5) 피부타입 특이 케어: 민감성 피부의 경우 고통/상처 유발 시술 중요도 하향
  log.debug("MATCHING LOG: ======== 1.5단계: 피부타입 조정 ========");
  if (skinTypeId === "sensitive") {
    log.debug("MATCHING LOG: 민감성 피부 감지 - 고통/상처 유발 시술 중요도 하향");
    const beforeCount = candidates.length;
    candidates = candidates.map((c) => {
      if (META[c.key].createsWound || META[c.key].pain >= 6) {
        log.debug("MATCHING LOG: 민감피부 조정:", c.key, "중요도", c.importance, "→", Math.min(3, c.importance + 1));
        return { ...c, importance: Math.min(3, c.importance + 1) as 1 | 2 | 3, why: `${c.why} (sensitive skin caution)` };
      }
      return c;
    });
    notes.push("Sensitive skin: Careful consideration recommended for pain-inducing/wound-creating treatments");
    log.debug("MATCHING LOG: 민감피부 조정 후 후보 수:", candidates.length, "(변경 없음: 중요도만 조정)");
  } else {
    log.debug("MATCHING LOG: 일반 피부타입 - 조정 없음");
  }

  // 1.6) 연령대 및 성별 기반 시술 가중치 조정 (효과 우선 적용)
  log.debug("MATCHING LOG: ======== 1.6단계: 연령대/성별 조정 ========");
  if (ageGroup) {
    log.debug("MATCHING LOG: 연령대 조정 적용:", ageGroup);
    const beforeAgeAdjust = candidates.length;
    candidates = adjustCandidatesByAgeGroup(candidates, ageGroup);
    log.debug("MATCHING LOG: 연령대 조정 후 후보 수:", candidates.length, "(변경된 후보들의 중요도 조정됨)");
  }
  if (gender) {
    log.debug("MATCHING LOG: 성별 조정 적용:", gender);
    const beforeGenderAdjust = candidates.length;
    candidates = adjustCandidatesByGender(candidates, gender);
    log.debug("MATCHING LOG: 성별 조정 후 후보 수:", candidates.length, "(변경된 후보들의 중요도 조정됨)");
  }

  // 2) 부위 필터링: 선택 부위에 맞지 않는 시술 제외
  log.debug("MATCHING LOG: ======== 2단계: 부위 필터링 ========");
  log.debug("MATCHING LOG: 선택된 시술 부위:", treatmentAreas);
  const beforeAreaFilter = candidates.length;
  candidates = filterByArea(candidates, treatmentAreas, excluded);
  log.debug("MATCHING LOG: 부위 필터링 후 후보 수:", beforeAreaFilter, "→", candidates.length);
  log.debug("MATCHING LOG: 부위 불일치로 제외된 시술 수:", beforeAreaFilter - candidates.length);
  if (excluded.length > 0) {
    log.debug("MATCHING LOG: 제외된 시술들:", excluded.map(e => `${e.key}(${e.reason})`));
  }

  // 3) 우선순위 기반 치환/제거: (통증, 다운타임, 가격 등의 우선순위 고려)
  log.debug("MATCHING LOG: ======== 3단계: 우선순위 기반 치환 ========");
  log.debug("MATCHING LOG: 우선순위:", priorityId);
  const beforePrioritySubst = candidates.length;
  const excludedBeforePriority = excluded.length;
  const substitutionsBefore = substitutions.length;
  candidates = substituteForPriority(candidates, priorityId, substitutions, excluded);
  log.debug("MATCHING LOG: 우선순위 적용 후 후보 수:", beforePrioritySubst, "→", candidates.length);
  log.debug("MATCHING LOG: 우선순위로 인한 치환 수:", substitutions.length - substitutionsBefore);
  log.debug("MATCHING LOG: 우선순위로 인한 추가 제외 수:", excluded.length - excludedBeforePriority);
  if (substitutions.length > substitutionsBefore) {
    log.debug("MATCHING LOG: 치환 내역:", substitutions.slice(substitutionsBefore).map(s => `${s.from}→${s.to}(${s.reason})`));
  }

  // 4) 예산 적용: 예산 상한을 초과하는 시술 제거/치환
  log.debug("MATCHING LOG: ======== 4단계: 예산 적용 ========");
  const budgetUpper = budgetUpperKRW(budgetRangeId);
  log.debug("MATCHING LOG: 예산 상한(KRW):", budgetUpper === Number.POSITIVE_INFINITY ? "무제한" : budgetUpper.toLocaleString());
  const currentTotal = candidates.reduce((sum, c) => sum + PRICE_TABLE[c.key], 0);
  log.debug("MATCHING LOG: 현재 총 비용(KRW):", currentTotal.toLocaleString());
  log.debug("MATCHING LOG: 예산 초과 여부:", currentTotal > budgetUpper ? "초과" : "적정");
  const beforeBudgetFilter = candidates.length;
  const excludedBeforeBudget = excluded.length;
  candidates = enforceBudget(candidates, budgetUpper, substitutions, excluded, priorityId);
  log.debug("MATCHING LOG: 예산 적용 후 후보 수:", beforeBudgetFilter, "→", candidates.length);
  log.debug("MATCHING LOG: 예산으로 인한 제외 수:", excluded.length - excludedBeforeBudget);
  const newTotal = candidates.reduce((sum, c) => sum + PRICE_TABLE[c.key], 0);
  log.debug("MATCHING LOG: 예산 적용 후 총 비용(KRW):", newTotal.toLocaleString());

  // 5) 최근 시술 이력 필터: 너무 이른 반복 시술 제거
  log.debug("MATCHING LOG: ======== 5단계: 최근 시술 이력 필터 ========");
  log.debug("MATCHING LOG: 최근 시술 이력:", pastTreatments);
  const beforePastFilter = candidates.length;
  const excludedBeforePast = excluded.length;
  candidates = applyPastFilters(candidates, pastTreatments, excluded);
  log.debug("MATCHING LOG: 시술 이력 적용 후 후보 수:", beforePastFilter, "→", candidates.length);
  log.debug("MATCHING LOG: 시술 이력으로 인한 제외 수:", excluded.length - excludedBeforePast);

  // 6) 의학적 상태 필터: 금기 시술 제거 (현재는 노트만, 필요시 확장)
  log.debug("MATCHING LOG: ======== 6단계: 의학적 상태 필터 ========");
  log.debug("MATCHING LOG: 의학적 상태:", medicalConditions);
  const beforeMedicalFilter = candidates.length;
  const excludedBeforeMedical = excluded.length;
  candidates = applyMedicalFilters(candidates, medicalConditions, excluded);
  log.debug("MATCHING LOG: 의학적 상태 적용 후 후보 수:", beforeMedicalFilter, "→", candidates.length);
  log.debug("MATCHING LOG: 의학적 상태로 인한 제외 수:", excluded.length - excludedBeforeMedical);

  // 7) 최종 추천 아이템 변환 + 총액 계산
  log.debug("MATCHING LOG: ======== 7단계: 최종 결과 생성 ========");
  log.debug("MATCHING LOG: 최종 후보 수:", candidates.length);
  log.debug("MATCHING LOG: 최종 후보 목록:", candidates.map(c => `${c.key}(중요도:${c.importance}, 이유:${c.why})`));
  const recommendations = toRecommendedItems(candidates);
  const totalPriceKRW = recommendations.reduce((acc, r) => acc + r.priceKRW, 0);
  const totalPriceUSD = krwToUsd(totalPriceKRW);
  log.debug("MATCHING LOG: 최종 추천 시술 수:", recommendations.length);
  log.debug("MATCHING LOG: 최종 총 비용 - KRW:", totalPriceKRW.toLocaleString(), "USD:", totalPriceUSD);
  log.debug("MATCHING LOG: 총 제외된 시술 수:", excluded.length);
  log.debug("MATCHING LOG: 총 치환된 시술 수:", substitutions.length);

  // 8) 업셀/대안 제안 생성
  const upgradeSuggestions = buildUpgradeSuggestions(excluded, substitutions, priorityId, budgetUpper);

  // 9) 추가 노트: 특수 상황에 대한 안내 추가
  if (medicalConditions.includes("pregnant")) {
    notes.push("During pregnancy: Injectable treatments and strong laser procedures are generally avoided. Please consult with a medical professional.");
  }
  if (medicalConditions.includes("antibiotics_or_steroids")) {
    notes.push("Taking antibiotics/steroids: Treatment timing and intensity should be adjusted considering skin recovery and infection risks.");
  }
  if (medicalConditions.includes("skin_condition")) {
    notes.push("Active chronic skin condition: Avoid treatments in affected areas and seek professional consultation.");
  }
  if (pastTreatments.includes("laser_2w")) {
    notes.push("Recent laser treatment within 2 weeks: Consider additional laser treatments after skin recovery.");
  }

  // 10) 결과 반환
  log.debug("MATCHING LOG: ======== 최종 결과 ========");
  log.debug("MATCHING LOG: 추천 시술:", recommendations.map(r => r.label));
  log.debug("MATCHING LOG: 제외 시술:", excluded.map(e => e.label));
  log.debug("MATCHING LOG: 결과 반환 완료");
  log.debug("MATCHING LOG: =======================================================");
  
  return {
    recommendations,
    totalPriceKRW,
    totalPriceUSD,
    excluded,
    substitutions,
    upgradeSuggestions,
    notes,
  };
}
