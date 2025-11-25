/**
 * 문진표 기반 맞춤 시술 추천 엔진 (TypeScript)
 * - 입력: 문진 결과(피부 고민/목표/부위/예산/우선순위/최근 시술/의학적 상태 등)
 * - 출력: 추천 시술 목록(이유), 총 비용(USD/KRW), 제외 시술(이유), 대체/업셀 제안
 *
 * ⚠️ 주의
 *  - 시술명은 영어 key를 그대로 사용합니다 (botox, ulthera_400 등).
 *  - 가격은 KRW 기준을 USD(환율 0.00072)로 변환합니다.
 *  - 임상적 안전성/정확도를 최대한 반영했으나, 실제 시술 결정은 반드시 전문의 상담을 거치세요.
 */

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
  skinConcerns: SelectedConcern[]; // 복수 가능
  treatmentGoals: (
    | "overall_refresh"
    | "lifting_firmness"
    | "texture_tone"
    | "anti_aging"
    | "acne_pore"
    | "recommendation"
  )[];
  treatmentAreas: AreaId[]; // 복수 가능
  budgetRangeId: BudgetId;
  priorityId: PriorityId; // 단일 최우선
  pastTreatments: PastId[]; // 복수 가능
  medicalConditions: MedicalId[]; // 복수 가능
}

export interface RecommendedItem {
  key: TreatmentKey;
  label: string;
  priceKRW: number;
  priceUSD: number;
  rationale: string[]; // 추천 이유(관심사/목표/우선순위/대체 사유 등)
}

export interface ExcludedItem {
  key: TreatmentKey;
  label: string;
  reason: string; // 제외 사유
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
  upgradeSuggestions: string[]; // 예산/통증 대안 업셀 메시지
  notes: string[]; // 알림/주의/한계
}

// ========= 원본 가격 테이블 (사용자가 제공한 데이터 반영) =========

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
  | "ultrasound" // HIFU/SOFWAVE 등
  | "rf" // 고주파/마이크로니들링 RF 포함
  | "injectable" // 주사형(보톡스/필러/스킨부스터/재생)
  | "other";

interface TreatmentMeta {
  key: TreatmentKey;
  label: string;
  category: Category;
  pain: number; // 1(매우 낮음) ~ 10(매우 높음)
  effectiveness: number; // 1(낮음) ~ 10(높음)
  downtime: number; // 0(없음) ~ 10(길다)
  areas: AreaId[]; // 적용 가능 부위
  createsWound?: boolean; // CO2/마니RF 등 상처/핏점 발생
  isLaser?: boolean; // laser 카테고리 식별
  isInjectable?: boolean; // injectable 식별
  // 동일 카테고리 내 대체 그룹(효과/가격/통증 균형 비교용)
  equivalenceGroup?: "lifting" | "vascular" | "pigment" | "texture" | "hydration" | "volume" | "acne" | "scars" | "jawline" | "body";
}

// 간단한 헬퍼: 얼굴 공통 에리어
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

const krwToUsd = (krw: number) => Math.round(krw * KRW_TO_USD);

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

// ========= 예산 한도 계산 =========

function budgetUpperKRW(id: BudgetId): number {
  switch (id) {
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

// ========= 기본 매핑: 고민/목표 -> 시술 후보 =========

/** 각 아이템은 [시술키, 중요도] 형태.
 *  - 중요도 1: 핵심(가능하면 유지)
 *  - 중요도 2: 보조(상황 봐서)
 *  - 중요도 3: 옵션(예산/우선순위에 따라 제거 쉬움)
 */
type Candidate = { key: TreatmentKey; importance: 1 | 2 | 3; why: string };

function addUnique(cands: Candidate[], add: Candidate[]) {
  add.forEach((c) => {
    if (!cands.find((x) => x.key === c.key)) cands.push(c);
  });
}

function baseCandidatesByConcern(c: SelectedConcern): Candidate[] {
  const { id } = c;
  const out: Candidate[] = [];

  switch (id) {
    case "acne-inflammatory": {
      addUnique(out, [
        { key: "capri", importance: 1, why: "acne(염증) 감소" },
        { key: "genesis", importance: 2, why: "피지/홍조 보조" },
        { key: "secret", importance: 2, why: "여드름 흉터/결(마니RF)" },
        { key: "potenza", importance: 2, why: "여드름 흉터/결(RF)" },
        { key: "fraxel", importance: 3, why: "흉터 레이저(다운타임)" },
      ]);
      break;
    }
    case "acne-whiteheads": {
      addUnique(out, [
        { key: "genesis", importance: 1, why: "면포/피지 조절" },
        { key: "capri", importance: 2, why: "여드름 보조" },
        { key: "secret", importance: 2, why: "여드름 흉터/결(마니RF)" },
        { key: "potenza", importance: 2, why: "여드름 흉터/결(RF)" },
        { key: "fraxel", importance: 3, why: "흉터 레이저(다운타임)" },
      ]);
      break;
    }
    case "pores": {
      addUnique(out, [
        { key: "genesis", importance: 1, why: "모공/결" },
        { key: "secret", importance: 2, why: "모공(마니RF)" },
        { key: "potenza", importance: 2, why: "모공(RF)" },
      ]);
      break;
    }
    case "redness": {
      addUnique(out, [
        { key: "v_beam", importance: 1, why: "혈관/홍조" },
        { key: "exel_v", importance: 2, why: "혈관/홍조" },
        { key: "genesis", importance: 2, why: "홍조 보조" },
      ]);
      break;
    }
    case "uneven_tone": {
      addUnique(out, [
        { key: "toning", importance: 1, why: "색소/톤 균일" },
        { key: "genesis", importance: 2, why: "결/혈행 보조" },
        { key: "repot_or_toning_and_genesis", importance: 3, why: "가벼운 패키지" },
      ]);
      break;
    }
    case "sagging": {
      addUnique(out, [
        { key: "ulthera_400", importance: 1, why: "리프팅(골드 스탠다드)" },
        { key: "thermage_600", importance: 1, why: "타이트닝(RF)" },
        { key: "liftera_400", importance: 2, why: "리프팅(가성비)" },
        { key: "scultra", importance: 2, why: "콜라겐/볼륨" },
      ]);
      break;
    }
    case "elasticity": {
      addUnique(out, [
        { key: "thermage_600", importance: 1, why: "탄력" },
        { key: "liftera_400", importance: 2, why: "탄력(가성비)" },
        { key: "oligio_600", importance: 2, why: "고주파 탄력" },
        { key: "scultra", importance: 2, why: "콜라겐" },
      ]);
      break;
    }
    case "double_chin": {
      addUnique(out, [
        { key: "tune_liner", importance: 1, why: "지방분해 주사(턱)" },
        { key: "ulthera_200", importance: 1, why: "턱선 리프팅" },
        { key: "onda", importance: 2, why: "지방/바디 컨투어" },
      ]);
      break;
    }
    case "volumizing": {
      addUnique(out, [{ key: "filler", importance: 1, why: "볼륨 보충" }]);
      break;
    }
    case "wrinkles": {
      addUnique(out, [
        { key: "botox", importance: 1, why: "표정주름" },
        { key: "fraxel", importance: 2, why: "잔주름/결" },
        { key: "skinbooster_ha", importance: 2, why: "미세주름/수분" },
      ]);
      break;
    }
    case "dryness_glow": {
      addUnique(out, [
        { key: "skinbooster-rejuran", importance: 1, why: "재생/수분/광" },
        { key: "skinbooster_ha", importance: 1, why: "수분/광" },
        { key: "exosome", importance: 2, why: "재생 보조" },
      ]);
      break;
    }
    case "pigmentation-freckles": {
      addUnique(out, [
        { key: "toning", importance: 1, why: "색소/톤(주근깨)" },
        { key: "genesis", importance: 2, why: "결/혈행 보조" },
      ]);
      break;
    }
    case "pigmentation-sun-damage": {
      addUnique(out, [
        { key: "toning", importance: 1, why: "색소/톤(햇빛 반점)" },
        { key: "genesis", importance: 2, why: "결/혈행 보조" },
      ]);
      break;
    }
    case "pigmentation-moles": {
      addUnique(out, [
        { key: "co2", importance: 1, why: "점/병변 제거" },
        { key: "toning", importance: 2, why: "색소 보조" },
      ]);
      break;
    }
    case "pigmentation-melasma": {
      addUnique(out, [
        { key: "toning", importance: 1, why: "색소/톤(기미)" },
        { key: "genesis", importance: 2, why: "결/혈행 보조" },
      ]);
      break;
    }
    case "pigmentation-lentigo": {
      addUnique(out, [
        { key: "toning", importance: 1, why: "색소/톤(렌티고)" },
        { key: "genesis", importance: 2, why: "결/혈행 보조" },
      ]);
      break;
    }
    case "pigmentation-not-sure": {
      addUnique(out, [
        { key: "toning", importance: 1, why: "색소/톤" },
        { key: "genesis", importance: 2, why: "결/혈행 보조" },
      ]);
      break;
    }
    case "scar-red": {
      addUnique(out, [
        { key: "v_beam", importance: 1, why: "붉은 흉터" },
        { key: "fraxel", importance: 2, why: "결/흉터 보조" },
        { key: "juvelook", importance: 3, why: "흉터/재생 주사" },
      ]);
      break;
    }
    case "scar-brown": {
      addUnique(out, [
        { key: "toning", importance: 1, why: "갈색 흉터" },
        { key: "fraxel", importance: 2, why: "결/흉터 보조" },
        { key: "juvelook", importance: 3, why: "흉터/재생 주사" },
      ]);
      break;
    }
    case "scar-rough": {
      addUnique(out, [
        { key: "fraxel", importance: 1, why: "결/흉터" },
        { key: "secret", importance: 2, why: "흉터(마니RF)" },
        { key: "potenza", importance: 2, why: "흉터(RF)" },
        { key: "juvelook", importance: 3, why: "흉터/재생 주사" },
      ]);
      break;
    }
    case "filler-forehead": {
      addUnique(out, [{ key: "filler", importance: 1, why: "이마 볼륨" }]);
      break;
    }
    case "filler-jawline": {
      addUnique(out, [{ key: "filler", importance: 1, why: "턱선 볼륨" }]);
      break;
    }
    case "filler-cheeks": {
      addUnique(out, [{ key: "filler", importance: 1, why: "볼 볼륨" }]);
      break;
    }
    case "filler-under-eyes": {
      addUnique(out, [{ key: "filler", importance: 1, why: "눈밑 볼륨" }]);
      break;
    }
    case "filler-body": {
      addUnique(out, [{ key: "filler", importance: 1, why: "바디 볼륨" }]);
      break;
    }
    case "other":
    default:
      break;
  }

  return out;
}

function baseCandidatesByGoal(goal: RecommendInputs["treatmentGoals"][number]): Candidate[] {
  const out: Candidate[] = [];
  switch (goal) {
    case "overall_refresh":
      addUnique(out, [
        { key: "repot_or_toning_and_genesis", importance: 1, why: "전반 톤/결 개선" },
        { key: "skinbooster_ha", importance: 2, why: "수분/광" },
      ]);
      break;
    case "lifting_firmness":
      addUnique(out, [
        { key: "ulthera_400", importance: 1, why: "리프팅" },
        { key: "thermage_600", importance: 1, why: "탄력" },
        { key: "liftera_400", importance: 2, why: "가성비 리프팅" },
        { key: "scultra", importance: 2, why: "콜라겐" },
      ]);
      break;
    case "texture_tone":
      addUnique(out, [
        { key: "genesis", importance: 1, why: "결/톤" },
        { key: "toning", importance: 1, why: "톤/색소" },
        { key: "fraxel", importance: 2, why: "결/잔주름" },
      ]);
      break;
    case "anti_aging":
      addUnique(out, [
        { key: "botox", importance: 1, why: "표정주름" },
        { key: "ulthera_400", importance: 1, why: "리프팅" },
        { key: "skinbooster-rejuran", importance: 2, why: "재생/수분" },
      ]);
      break;
    case "acne_pore":
      addUnique(out, [
        { key: "capri", importance: 1, why: "여드름" },
        { key: "genesis", importance: 1, why: "모공/결" },
        { key: "potenza", importance: 2, why: "흉터/결" },
      ]);
      break;
    case "recommendation":
      addUnique(out, [
        { key: "repot_or_toning_and_genesis", importance: 1, why: "전반 개선 패키지" },
        { key: "skinbooster_ha", importance: 2, why: "수분/광" },
      ]);
      break;
  }
  return out;
}

// ========= 우선순위 기반 치환/제거 규칙 =========

function substituteForPriority(
  list: Candidate[],
  priority: PriorityId,
  substitutions: Substitution[],
  excluded: ExcludedItem[],
): Candidate[] {
  // 치환을 쉽게 하기 위해 배열로 작업
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
      excluded.push({ key: from, label: META[from].label, reason: `중복 목적 → ${to} 유지` });
    }
  };

  if (priority === "price") {
    // 고가 리프팅 장비 → 가성비 장비로
    if (has("ulthera_800")) replace("ulthera_800", "liftera_800", "price");
    if (has("ulthera_600")) replace("ulthera_600", "liftera_600", "price");
    if (has("ulthera_400")) replace("ulthera_400", "liftera_400", "price");
    if (has("thermage_900")) replace("thermage_900", "sof_wave_300", "price");
    if (has("thermage_600")) replace("thermage_600", "sof_wave_200", "price");
    // 텍스처: 다운타임/비용 큰 것 → 가벼운 것으로
    ["co2", "fraxel"].forEach((t) => {
      if (has(t as TreatmentKey)) replace(t as TreatmentKey, "genesis", "price");
    });
  }

  if (priority === "pain") {
    // 통증 높은 HIFU → thermage/sof wave/liftera로 완화
    ["ulthera_800", "ulthera_600", "ulthera_400", "ulthera_200"].forEach((t) => {
      if (has(t as TreatmentKey)) replace(t as TreatmentKey, "sof_wave_300", "pain");
    });
    // 통증 큰 CO2/마니RF → 제너시스/토닝 등으로
    ["co2", "fraxel", "secret", "potenza"].forEach((t) => {
      if (has(t as TreatmentKey)) replace(t as TreatmentKey, "genesis", "pain");
    });
  }

  if (priority === "recoveryTime") {
    // 다운타임 큰 시술 제거/치환
    ["co2", "fraxel"].forEach((t) => {
      const idx = arr.findIndex((c) => c.key === (t as TreatmentKey));
      if (idx >= 0) {
        excluded.push({
          key: t as TreatmentKey,
          label: META[t as TreatmentKey].label,
          reason: "다운타임 우선순위로 제외",
        });
        arr.splice(idx, 1);
        // 대체
        if (!has("genesis")) {
          arr.push({ key: "genesis", importance: 2, why: "다운타임 최소 대체" });
        }
      }
    });
  }

  // MATCHING_TODO_CHECK: reviews와 location 우선순위에 대한 로직이 구현되지 않음. 알고리즘 요구사항 확인 필요
  if (priority === "reviews") {
    // MATCHING_TODO_CHECK: 리뷰 우선순위 처리 로직 필요
  }

  if (priority === "location") {
    // MATCHING_TODO_CHECK: 병원 위치 우선순위 처리 로직 필요
  }

  // effectiveness는 별도 치환 필요 없음(나중 예산 내에서 유지 쪽)

  return arr;
}

// ========= 예산 적용 (초과 시 정리/치환) =========

function enforceBudget(
  cands: Candidate[],
  budgetUpper: number,
  substitutions: Substitution[],
  excluded: ExcludedItem[],
  priority: PriorityId,
): Candidate[] {
  // 총액 계산
  const sumKRW = (xs: Candidate[]) =>
    xs.reduce((acc, x) => acc + PRICE_TABLE[x.key], 0);

  let arr = [...cands];
  let total = sumKRW(arr);

  if (total <= budgetUpper) return arr;

  // 1) 옵션(importance 3)부터 제거
  const byRemovability = [...arr].sort((a, b) => {
    // 중요도 낮고, 비싼 것부터 제거
    if (a.importance !== b.importance) return b.importance - a.importance;
    return PRICE_TABLE[b.key] - PRICE_TABLE[a.key];
  });

  for (const c of byRemovability) {
    if (total <= budgetUpper) break;
    // 핵심(importance 1)은 일단 유지하고, 2/3 우선 제거
    if (c.importance > 1) {
      arr = arr.filter((x) => x.key !== c.key);
      excluded.push({
        key: c.key,
        label: META[c.key].label,
        reason: `예산 초과로 제거(중요도 ${c.importance})`,
      });
      total = sumKRW(arr);
    }
  }

  if (total <= budgetUpper) return arr;

  // 2) 리프팅 계열: 더 저렴한 대체로 단계적 다운스케일
  const present = (keys: TreatmentKey[]) => keys.find((k) => arr.some((c) => c.key === k));
  const tryScaleDown = (order: TreatmentKey[]) => {
    let changed = false;
    for (let i = 0; i < order.length; i++) {
      const k = order[i];
      const idx = arr.findIndex((c) => c.key === k);
      if (idx >= 0) {
        // 아래쪽(저가/저효)로 치환
        for (let j = i + 1; j < order.length; j++) {
          const alt = order[j];
          if (!arr.find((c) => c.key === alt)) {
            const before = arr[idx];
            arr[idx] = { ...before, key: alt, why: `${before.why} → 예산 대체` };
            substitutions.push({ from: k, to: alt, reason: "price" });
            changed = true;
            total = sumKRW(arr);
            if (total <= budgetUpper) return true;
            break;
          }
        }
      }
    }
    return changed;
  };

  // 순차 다운그레이드
  if (present(LIFTING_ORDER)) {
    while (total > budgetUpper && tryScaleDown(LIFTING_ORDER)) {
      /* 반복 치환 */
    }
  }

  // 3) 텍스처 강 시술 → 경 시술 치환
  TEXTURE_STRONG.forEach((t) => {
    const idx = arr.findIndex((c) => c.key === t);
    if (idx >= 0 && total > budgetUpper) {
      const before = arr[idx];
      const alt = TEXTURE_GENTLE.find((g) => !arr.find((c) => c.key === g)) || "genesis";
      arr[idx] = { ...before, key: alt, why: `${before.why} → 예산 대체(경)` };
      substitutions.push({ from: t, to: alt, reason: "price" });
      total = sumKRW(arr);
    }
  });

  // 4) 그래도 초과면, 보조(importance 2)까지 정리
  if (total > budgetUpper) {
    const sortByCostDesc = [...arr].sort(
      (a, b) => PRICE_TABLE[b.key] - PRICE_TABLE[a.key],
    );
    for (const c of sortByCostDesc) {
      if (total <= budgetUpper) break;
      if (c.importance >= 2) {
        arr = arr.filter((x) => x.key !== c.key);
        excluded.push({
          key: c.key,
          label: META[c.key].label,
          reason: `예산 초과로 제거(비용 상위)`,
        });
        total = sumKRW(arr);
      }
    }
  }

  // 5) 최후: 핵심이라도 1개 남기고 일부 제거
  if (total > budgetUpper) {
    const essentials = arr.filter((x) => x.importance === 1);
    if (essentials.length > 1) {
      // 비용 큰 핵심부터 제거, 1~2개만 남기기
      const byCostDesc = essentials.sort((a, b) => PRICE_TABLE[b.key] - PRICE_TABLE[a.key]);
      for (let i = 0; i < byCostDesc.length - 1 && total > budgetUpper; i++) {
        const c = byCostDesc[i];
        arr = arr.filter((x) => x.key !== c.key);
        excluded.push({
          key: c.key,
          label: META[c.key].label,
          reason: `예산 초과로 핵심 축소`,
        });
        total = sumKRW(arr);
      }
    }
  }

  return arr;
}

// ========= 최근 시술/의학적 상태 필터 =========

function applyPastFilters(
  arr: Candidate[],
  past: PastId[],
  excluded: ExcludedItem[],
): Candidate[] {
  let out = [...arr];

  if (past.includes("botox_4m")) {
    if (out.some((c) => c.key === "botox")) {
      out = out.filter((c) => c.key !== "botox");
      excluded.push({ key: "botox", label: META["botox"].label, reason: "최근 4개월 내 botox 시술" });
    }
  }
  if (past.includes("filler_2w")) {
    if (out.some((c) => c.key === "filler")) {
      out = out.filter((c) => c.key !== "filler");
      excluded.push({ key: "filler", label: META["filler"].label, reason: "최근 2주 내 filler 시술" });
    }
  }
  if (past.includes("laser_2w")) {
    const lasers = out.filter((c) => isLaser(c.key));
    if (lasers.length) {
      out = out.filter((c) => !isLaser(c.key));
      lasers.forEach((l) =>
        excluded.push({
          key: l.key,
          label: META[l.key].label,
          reason: "최근 2주 내 laser 시술",
        }),
      );
    }
  }
  if (past.includes("skinbooster_2w")) {
    const boosters = out.filter((c) => c.key.startsWith("skinbooster"));
    if (boosters.length) {
      out = out.filter((c) => !c.key.startsWith("skinbooster"));
      boosters.forEach((b) =>
        excluded.push({
          key: b.key,
          label: META[b.key].label,
          reason: "최근 2주 내 skinbooster 시술",
        }),
      );
    }
  }
  if (past.includes("stemcell_1m")) {
    if (out.some((c) => c.key === "stem_cell")) {
      out = out.filter((c) => c.key !== "stem_cell");
      excluded.push({
        key: "stem_cell",
        label: META["stem_cell"].label,
        reason: "최근 1개월 내 stem cell 시술",
      });
    }
  }
  // stemcell_1_6m 은 재시술 필요 적을 수 있어 가중치만 낮출 수도 있으나, 여기서는 유지

  return out;
}

function applyMedicalFilters(
  arr: Candidate[],
  medical: MedicalId[],
  excluded: ExcludedItem[],
): Candidate[] {
  let out = [...arr];

  if (medical.includes("pregnant")) {
    // 임신 중: 주사형/공격적 시술 제외(보톡스/필러/스킨부스터/CO2/마니RF 등)
    const drop = out.filter(
      (c) => isInjectable(c.key) || createsWound(c.key),
    );
    if (drop.length) {
      out = out.filter((c) => !drop.includes(c));
      drop.forEach((d) =>
        excluded.push({
          key: d.key,
          label: META[d.key].label,
          reason: "임신 중 금기/지양",
        }),
      );
    }
  }

  if (medical.includes("blood_clotting")) {
    // 출혈/멍 위험: 주사류 지양
    const drop = out.filter((c) => isInjectable(c.key));
    if (drop.length) {
      out = out.filter((c) => !drop.includes(c));
      drop.forEach((d) =>
        excluded.push({
          key: d.key,
          label: META[d.key].label,
          reason: "혈액응고 장애: 주사 시술 지양",
        }),
      );
    }
  }

  if (medical.includes("immunosuppressants")) {
    // 상처(감염 위험) 생성 시술 제외: CO2/마니RF
    const drop = out.filter((c) => createsWound(c.key));
    if (drop.length) {
      out = out.filter((c) => !drop.includes(c));
      drop.forEach((d) =>
        excluded.push({
          key: d.key,
          label: META[d.key].label,
          reason: "면역억제: 상처 유발 시술 지양",
        }),
      );
    }
  }

  // skin_allergy, skin_condition, antibiotics_or_steroids 은 강제 제외 대신 주석/노트로 경고 가능
  return out;
}

// ========= 최종 계산/출력 구성 =========

function toRecommendedItems(cands: Candidate[]): RecommendedItem[] {
  return cands.map((c) => {
    const krw = PRICE_TABLE[c.key];
    return {
      key: c.key,
      label: META[c.key].label,
      priceKRW: krw,
      priceUSD: krwToUsd(krw),
      rationale: [c.why],
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
        reason: `선택 부위와 부적합`,
      });
    }
  }
  return out;
}

// ========= 업셀/대안 제안 생성 =========

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
        `예산 여유가 생기면 **${META[s.from].label}**을(를) 고려해 보세요. 현재는 **${META[s.to].label}**로 대체되었습니다.`,
      );
    });

  // 통증/다운타임으로 제외/치환
  if (priority === "pain") {
    const painDrops = excluded.filter((e) =>
      /통증|pain|치환/.test(e.reason),
    );
    if (painDrops.length > 0) {
      msgs.push(
        `통증이 걱정된다면 **강한 국소마취/진정(수면)요법**을 활용하면 선택지가 넓어집니다. 예: ${painDrops
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
        `다운타임을 일부 감수할 수 있다면 **1~2회 고강도 시술**(예: ${dtDrops
          .slice(0, 3)
          .map((e) => META[e.key].label)
          .join(", ")})로 빠른 개선이 가능합니다.`,
      );
    }
  }

  // 예산 초과로 빠진 핵심들
  const budgetDrops = excluded.filter((e) => /예산 초과/.test(e.reason));
  if (budgetDrops.length > 0 && Number.isFinite(budgetUpper)) {
    msgs.push(
      `예산을 소폭 상향하면 제외된 시술(예: ${budgetDrops
        .slice(0, 3)
        .map((e) => META[e.key].label)
        .join(", ")})을 포함해 **효과를 극대화**할 수 있습니다.`,
    );
  }

  return msgs;
}

// ========= 메인 진입 함수 =========

export function recommendTreatments(input: RecommendInputs): RecommendationOutput {
  const {
    skinTypeId,
    skinConcerns,
    treatmentGoals,
    treatmentAreas,
    budgetRangeId,
    priorityId,
    pastTreatments,
    medicalConditions,
  } = input;

  const excluded: ExcludedItem[] = [];
  const substitutions: Substitution[] = [];
  const notes: string[] = [];

  // 0) 입력 정규화: gensis → genesis 대체
  // (선택지는 key가 아님. 실제 추천 결과에 gensis가 들어오지 않도록 post-step에서 처리)
  // 여기서는 META/PRICE 레벨에서 이미 gensis 정의했으므로 그대로 사용 가능.

  // 1) 기본 후보 수집
  let candidates: Candidate[] = [];
  skinConcerns.forEach((c) => addUnique(candidates, baseCandidatesByConcern(c)));
  treatmentGoals.forEach((g) => addUnique(candidates, baseCandidatesByGoal(g)));

  // 피부타입 특이 케어 (민감성 -> 강한 시술 중요도 하향)
  if (skinTypeId === "sensitive") {
    candidates = candidates.map((c) =>
      createsWound(c.key) || META[c.key].pain >= 6
        ? { ...c, importance: (Math.min(3, c.importance + 1) as 1 | 2 | 3), why: `${c.why} (민감피부 주의)` }
        : c,
    );
    notes.push("민감성 피부: 통증/상처 유발 시술은 신중 권고");
  }

  // 2) 부위 필터
  candidates = filterByArea(candidates, treatmentAreas, excluded);

  // 3) 우선순위 치환/제거
  candidates = substituteForPriority(candidates, priorityId, substitutions, excluded);

  // 4) 예산 적용
  const budgetUpper = budgetUpperKRW(budgetRangeId);
  candidates = enforceBudget(candidates, budgetUpper, substitutions, excluded, priorityId);

  // 5) 최근 시술 필터
  candidates = applyPastFilters(candidates, pastTreatments, excluded);

  // 6) 의학적 상태 필터
  candidates = applyMedicalFilters(candidates, medicalConditions, excluded);

  // 7) 추천 아이템 변환 + 총액 계산
  let recItems = toRecommendedItems(candidates);
  let totalKRW = recItems.reduce((acc, r) => acc + r.priceKRW, 0);
  let totalUSD = krwToUsd(totalKRW);

  // 8) 업셀/대안 제안
  const upgradeSuggestions = buildUpgradeSuggestions(excluded, substitutions, priorityId, budgetUpper);

  // 9) 추가 노트
  if (medicalConditions.includes("pregnant")) {
    notes.push("임신 중: 주사/공격적 레이저는 일반적으로 지양됩니다. 전문의 상담 후 결정하세요.");
  }
  if (medicalConditions.includes("antibiotics_or_steroids")) {
    notes.push("항생제/스테로이드 복용 중: 피부 회복/감염 위험 고려하여 시술 시기/강도 조정이 필요합니다.");
  }
  if (medicalConditions.includes("skin_condition")) {
    notes.push("만성 피부질환: 활성 병변 위 시술은 피하고, 전문의와 병행 치료를 권장합니다.");
  }
  if (pastTreatments.includes("laser_2w")) {
    notes.push("최근 2주 내 레이저 시술: 추가 레이저는 회복 후 검토하는 것을 권장합니다.");
  }

  // 10) 결과 반환
  return {
    recommendations: recItems,
    totalPriceKRW: totalKRW,
    totalPriceUSD: totalUSD,
    excluded,
    substitutions,
    upgradeSuggestions,
    notes,
  };
}

// ========= 사용 예시 =========
/*
const output = recommendTreatments({
  skinTypeId: "combination",
  skinConcerns: [
    { id: "sagging" },
    { id: "wrinkles" },
    { id: "pigmentation", subOptions: ["melasma"] },
  ],
  treatmentGoals: ["lifting_firmness", "anti_aging"],
  treatmentAreas: ["full-face", "jawline"],
  budgetRangeId: "1000-5000",
  priorityId: "effectiveness",
  pastTreatments: ["none"],
  medicalConditions: ["none"],
});
log.debug(output);
*/
