/**
 * 문진표 기반 맞춤 시술 추천 엔진 (TypeScript) - 전체 구현본
 * - 입력: 피부타입, 연령대, 성별, 고민/목표, 부위, 예산, 우선순위, 과거 시술, 의학적 상태
 * - 출력: 추천 시술(영문 텍스트), 총 비용(USD/KRW), 제외 시술(사유, 영문), 치환 목록, 업셀 제안(영문), 노트(영문)
 *
 * ✅ 요구 반영
 *  - 생략 없음: 예산 초과 시 핵심 시술 대체 로직 / stem_cell 케이스 / 의료 상태 필터 모두 구현
 *  - 성별/나이 가중치: 효과 중심으로 우선 적용 (안전성보다 효과 우선)
 *  - 출력 텍스트는 모두 영문, 주석은 한국어
 */

import { getKRWToUSD, krwToUsdSync } from "@/utils/exchangeRate/converter";

///////////////////////////////
// 상수/타입
///////////////////////////////

// import { getCurrentExchangeRate } from '@/utils/exchangeRate';

// // Dynamic exchange rate function - use this instead of constant
// export const getKRWToUSD = (): number => getCurrentExchangeRate();

// 시술 키 (의뢰인이 제공한 목록 그대로 반영)
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

type SkinTypeId = "dry" | "oily" | "combination" | "sensitive" | "normal" | "not_sure";

// 연령대(문자열 구분)
type AgeGroup = "teens" | "20s" | "30s" | "40s" | "50s" | "60s" | "70_plus";

// 성별
type Gender = "male" | "female" | "non_binary" | "no_answer";

// 고민(키 변경 가능성 고려: original과 호환)
export interface SelectedConcern {
  id:
    // Acne
    | "acne"
    | "acne-inflammatory"
    | "acne-whiteheads"
    // Texture/Pores/Redness
    | "pores"
    | "redness"
    | "uneven_tone"
    // Laxity/Elasticity/Double chin
    | "sagging"
    | "elasticity"
    | "doublie_chin" // 오타 호환
    | "double_chin"
    // Volume/Wrinkles/Dryness
    | "volumizing"
    | "wrinkles"
    | "dryness_glow"
    // Pigmentation
    | "pigmentation"
    | "pigmentation-freckles"
    | "pigmentation-sun-damage"
    | "pigmentation-moles"
    | "pigmentation-melasma"
    | "pigmentation-lentigo"
    | "pigmentation-not-sure"
    // Scars
    | "scars"
    | "scar-red"
    | "scar-brown"
    | "scar-rough"
    // Filler sub-areas
    | "filler"
    | "filler-forehead"
    | "filler-jawline"
    | "filler-cheeks"
    | "filler-under-eyes"
    | "filler-body"
    // Other
    | "other";
  subOptions?: string[]; // 구버전 호환 (예: ["moles", "inflammatory-acne"])
}

// 입력
export interface RecommendInputs {
  skinTypeId?: SkinTypeId;
  ageGroup?: AgeGroup;
  gender?: Gender;
  skinConcerns: SelectedConcern[];
  treatmentGoals: (
    | "overall_refresh"
    | "lifting_firmness"
    | "texture_tone"
    | "anti_aging"
    | "acne_pore"
    | "recommendation"
  )[];
  treatmentAreas: AreaId[];
  budgetRangeId: BudgetId;
  priorityId: PriorityId;
  pastTreatments: PastId[];
  medicalConditions: MedicalId[];
}

// 출력
export interface RecommendedItem {
  key: TreatmentKey;
  label: string;
  priceKRW: number;
  priceUSD: number;
  rationale: string[]; // 영문
}
export interface ExcludedItem {
  key: TreatmentKey;
  label: string;
  reason: string; // 영문
}
export interface Substitution {
  from: TreatmentKey;
  to: TreatmentKey;
  reason: "price" | "pain" | "recoveryTime"; // 영문 키
}
export interface RecommendationOutput {
  recommendations: RecommendedItem[];
  totalPriceKRW: number;
  totalPriceUSD: number;
  excluded: ExcludedItem[];
  substitutions: Substitution[];
  upgradeSuggestions: string[]; // 영문
  notes: string[]; // 영문
}

///////////////////////////////
// 가격 테이블 (KRW)
///////////////////////////////

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
  gensis: 80000, // 오타 별칭
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

///////////////////////////////
// 시술 메타데이터
///////////////////////////////

type Category = "laser" | "ultrasound" | "rf" | "injectable" | "other";
interface TreatmentMeta {
  key: TreatmentKey;
  label: string;
  category: Category;
  pain: number;          // 1~10 (높을수록 통증 큼)
  effectiveness: number; // 1~10 (높을수록 효과 큼)
  downtime: number;      // 0~10 (높을수록 다운타임 김)
  areas: AreaId[];
  createsWound?: boolean; // 상처/핏점 유발
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

const FACE_AREAS: AreaId[] = ["full-face", "forehead", "eye-area", "cheeks", "jawline", "neck"];

// 메타 (상대 비교 기준으로 점수화)
const META: Record<TreatmentKey, TreatmentMeta> = {
  botox: { key: "botox", label: "botox", category: "injectable", pain: 2, effectiveness: 8, downtime: 1, areas: ["forehead","eye-area","jawline","full-face"], isInjectable: true, equivalenceGroup: "texture" },
  capri: { key: "capri", label: "capri", category: "laser", pain: 2, effectiveness: 6, downtime: 0, areas: FACE_AREAS, isLaser: true, equivalenceGroup: "acne" },
  co2: { key: "co2", label: "co2", category: "laser", pain: 8, effectiveness: 9, downtime: 7, areas: FACE_AREAS, createsWound: true, isLaser: true, equivalenceGroup: "texture" },
  density_600: { key: "density_600", label: "density", category: "ultrasound", pain: 6, effectiveness: 8, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  density_900: { key: "density_900", label: "density", category: "ultrasound", pain: 6, effectiveness: 9, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  exel_v: { key: "exel_v", label: "exel v", category: "laser", pain: 4, effectiveness: 7, downtime: 2, areas: FACE_AREAS, isLaser: true, equivalenceGroup: "vascular" },
  exosome: { key: "exosome", label: "exosome", category: "injectable", pain: 3, effectiveness: 6, downtime: 1, areas: FACE_AREAS, isInjectable: true, equivalenceGroup: "hydration" },
  filler: { key: "filler", label: "filler", category: "injectable", pain: 3, effectiveness: 9, downtime: 2, areas: FACE_AREAS.concat(["body"]), isInjectable: true, equivalenceGroup: "volume" },
  genesis: { key: "genesis", label: "genesis", category: "laser", pain: 2, effectiveness: 6, downtime: 0, areas: FACE_AREAS, isLaser: true, equivalenceGroup: "texture" },
  gensis: { key: "gensis", label: "gensis", category: "laser", pain: 2, effectiveness: 6, downtime: 0, areas: FACE_AREAS, isLaser: true, equivalenceGroup: "texture" },
  inmode: { key: "inmode", label: "inmode", category: "rf", pain: 4, effectiveness: 7, downtime: 1, areas: FACE_AREAS.concat(["body"]), equivalenceGroup: "lifting" },
  juvegen: { key: "juvegen", label: "juvegen", category: "injectable", pain: 3, effectiveness: 6, downtime: 1, areas: FACE_AREAS, isInjectable: true, equivalenceGroup: "hydration" },
  juvelook: { key: "juvelook", label: "juvelook", category: "injectable", pain: 4, effectiveness: 7, downtime: 2, areas: FACE_AREAS, isInjectable: true, equivalenceGroup: "scars" },
  liftera_200: { key: "liftera_200", label: "liftera", category: "ultrasound", pain: 5, effectiveness: 6, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  liftera_400: { key: "liftera_400", label: "liftera", category: "ultrasound", pain: 5, effectiveness: 7, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  liftera_600: { key: "liftera_600", label: "liftera", category: "ultrasound", pain: 5, effectiveness: 8, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  liftera_800: { key: "liftera_800", label: "liftera", category: "ultrasound", pain: 5, effectiveness: 8, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  neobeam: { key: "neobeam", label: "neobeam", category: "laser", pain: 2, effectiveness: 6, downtime: 0, areas: FACE_AREAS, isLaser: true, equivalenceGroup: "texture" },
  oligio_600: { key: "oligio_600", label: "oligio", category: "rf", pain: 5, effectiveness: 7, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  oligio_900: { key: "oligio_900", label: "oligio", category: "rf", pain: 5, effectiveness: 8, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  onda: { key: "onda", label: "onda", category: "rf", pain: 4, effectiveness: 7, downtime: 1, areas: ["body","jawline"], equivalenceGroup: "body" },
  potenza: { key: "potenza", label: "potenza", category: "rf", pain: 6, effectiveness: 8, downtime: 4, areas: FACE_AREAS, createsWound: true, equivalenceGroup: "texture" },
  fraxel: { key: "fraxel", label: "fraxel", category: "laser", pain: 6, effectiveness: 8, downtime: 6, areas: FACE_AREAS, createsWound: true, isLaser: true, equivalenceGroup: "texture" },
  repot_or_toning_and_genesis: { key: "repot_or_toning_and_genesis", label: "repot or toning&genesis", category: "laser", pain: 2, effectiveness: 5, downtime: 0, areas: FACE_AREAS, isLaser: true, equivalenceGroup: "texture" },
  scultra: { key: "scultra", label: "scultra", category: "injectable", pain: 4, effectiveness: 8, downtime: 2, areas: FACE_AREAS, isInjectable: true, equivalenceGroup: "volume" },
  secret: { key: "secret", label: "secret", category: "rf", pain: 6, effectiveness: 8, downtime: 4, areas: FACE_AREAS, createsWound: true, equivalenceGroup: "texture" },
  shrink_200: { key: "shrink_200", label: "shrink", category: "ultrasound", pain: 5, effectiveness: 5, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  shrink_400: { key: "shrink_400", label: "shrink", category: "ultrasound", pain: 5, effectiveness: 6, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  shrink_600: { key: "shrink_600", label: "shrink", category: "ultrasound", pain: 5, effectiveness: 7, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  shrink_800: { key: "shrink_800", label: "shrink", category: "ultrasound", pain: 5, effectiveness: 7, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  "skinbooster-rejuran": { key: "skinbooster-rejuran", label: "skinbooster rejuran", category: "injectable", pain: 4, effectiveness: 7, downtime: 2, areas: FACE_AREAS, isInjectable: true, equivalenceGroup: "hydration" },
  skinbooster_juvelook: { key: "skinbooster_juvelook", label: "skinbooster juvelook", category: "injectable", pain: 4, effectiveness: 7, downtime: 2, areas: FACE_AREAS, isInjectable: true, equivalenceGroup: "hydration" },
  skinbooster_ha: { key: "skinbooster_ha", label: "skinbooster ha", category: "injectable", pain: 4, effectiveness: 6, downtime: 2, areas: FACE_AREAS, isInjectable: true, equivalenceGroup: "hydration" },
  sof_wave_200: { key: "sof_wave_200", label: "sof wave", category: "ultrasound", pain: 4, effectiveness: 7, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  sof_wave_300: { key: "sof_wave_300", label: "sof wave", category: "ultrasound", pain: 4, effectiveness: 8, downtime: 1, areas: FACE_AREAS, equivalenceGroup: "lifting" },
  stem_cell: { key: "stem_cell", label: "stem cell", category: "injectable", pain: 4, effectiveness: 7, downtime: 2, areas: FACE_AREAS, isInjectable: true, equivalenceGroup: "hydration" },
  thermage_600: { key: "thermage_600", label: "thermage", category: "rf", pain: 5, effectiveness: 8, downtime: 1, areas: FACE_AREAS.concat(["body"]), equivalenceGroup: "lifting" },
  thermage_900: { key: "thermage_900", label: "thermage", category: "rf", pain: 5, effectiveness: 9, downtime: 1, areas: FACE_AREAS.concat(["body"]), equivalenceGroup: "lifting" },
  toning: { key: "toning", label: "toning", category: "laser", pain: 2, effectiveness: 6, downtime: 0, areas: FACE_AREAS, isLaser: true, equivalenceGroup: "pigment" },
  tune_face: { key: "tune_face", label: "tune face", category: "rf", pain: 5, effectiveness: 7, downtime: 1, areas: ["jawline","full-face"], equivalenceGroup: "jawline" },
  tune_liner: { key: "tune_liner", label: "tune liner", category: "injectable", pain: 4, effectiveness: 7, downtime: 2, areas: ["jawline"], isInjectable: true, equivalenceGroup: "jawline" },
  ulthera_200: { key: "ulthera_200", label: "ulthera", category: "ultrasound", pain: 7, effectiveness: 7, downtime: 1, areas: ["jawline","neck","full-face","forehead","cheeks"], equivalenceGroup: "lifting" },
  ulthera_400: { key: "ulthera_400", label: "ulthera", category: "ultrasound", pain: 7, effectiveness: 9, downtime: 1, areas: ["jawline","neck","full-face","forehead","cheeks"], equivalenceGroup: "lifting" },
  ulthera_600: { key: "ulthera_600", label: "ulthera", category: "ultrasound", pain: 7, effectiveness: 9, downtime: 1, areas: ["jawline","neck","full-face","forehead","cheeks"], equivalenceGroup: "lifting" },
  ulthera_800: { key: "ulthera_800", label: "ulthera", category: "ultrasound", pain: 7, effectiveness: 10, downtime: 1, areas: ["jawline","neck","full-face","forehead","cheeks"], equivalenceGroup: "lifting" },
  v_beam: { key: "v_beam", label: "v beam", category: "laser", pain: 4, effectiveness: 7, downtime: 2, areas: FACE_AREAS, isLaser: true, equivalenceGroup: "vascular" },
};

///////////////////////////////
// 유틸리티
///////////////////////////////

const isLaser = (t: TreatmentKey) => META[t].category === "laser" || !!META[t].isLaser;
const isInjectable = (t: TreatmentKey) => META[t].category === "injectable" || !!META[t].isInjectable;
const createsWound = (t: TreatmentKey) => !!META[t].createsWound;

const inAreas = (t: TreatmentKey, selected: AreaId[]) => {
  if (selected.length === 0) return true;
  if (selected.includes("full-face")) return META[t].areas.some((a) => FACE_AREAS.includes(a));
  return META[t].areas.some((a) => selected.includes(a));
};

// const krwToUsd = (krw: number) => Math.round(krw * getKRWToUSD());
const formatUSD = (usd: number) => `$${usd.toLocaleString("en-US")}`;
const formatKRW = (krw: number) => `${krw.toLocaleString("ko-KR")}원`;

///////////////////////////////
// 등가/대체 관계 목록
///////////////////////////////

const LIFTING_ORDER: TreatmentKey[] = [
  "ulthera_800","ulthera_600","ulthera_400",
  "thermage_900","thermage_600",
  "sof_wave_300","sof_wave_200",
  "density_900","density_600",
  "liftera_800","liftera_600","liftera_400","liftera_200",
  "shrink_800","shrink_600","shrink_400","shrink_200",
  "inmode",
];

const TEXTURE_STRONG: TreatmentKey[] = ["co2","fraxel","potenza","secret"];
const TEXTURE_GENTLE: TreatmentKey[] = ["genesis","neobeam","repot_or_toning_and_genesis"];
const VASCULAR_ORDER: TreatmentKey[] = ["v_beam","exel_v","genesis"];
const PIGMENT_ORDER: TreatmentKey[] = ["toning","genesis"];
const HYDRATION_ORDER: TreatmentKey[] = ["skinbooster-rejuran","skinbooster_juvelook","skinbooster_ha","exosome","stem_cell"];
const VOLUME_ORDER: TreatmentKey[] = ["filler","scultra"];
const ACNE_ORDER: TreatmentKey[] = ["capri","genesis","v_beam"];
const SCAR_ORDER: TreatmentKey[] = ["fraxel","secret","potenza","juvelook"];

///////////////////////////////
// 후보 타입/헬퍼
///////////////////////////////

type Candidate = { key: TreatmentKey; importance: 1|2|3; why: string }; // why는 영문
const addUnique = (arr: Candidate[], add: Candidate[]) => add.forEach(c => { if (!arr.find(x => x.key === c.key)) arr.push(c); });

///////////////////////////////
// 고민 → 기본 후보 매핑
///////////////////////////////

function baseCandidatesByConcern(c: SelectedConcern): Candidate[] {
  const { id, subOptions = [] } = c;
  const out: Candidate[] = [];

  switch (id) {
    case "acne":
    case "acne-inflammatory":
      addUnique(out, [
        { key: "capri", importance: 1, why: "Targets inflammatory acne and sebum control" },
        { key: "genesis", importance: 2, why: "Supports oil control and texture" },
        { key: "secret", importance: 2, why: "Microneedling RF for acne scarring/texture" },
        { key: "potenza", importance: 2, why: "RF for acne scars and pores" },
        { key: "fraxel", importance: 3, why: "Fractional resurfacing for scars (downtime)" },
      ]);
      break;
    case "acne-whiteheads":
      addUnique(out, [
        { key: "genesis", importance: 1, why: "Improves comedones and texture" },
        { key: "capri", importance: 2, why: "Assists acne clearance" },
        { key: "secret", importance: 2, why: "Microneedling RF for texture" },
        { key: "potenza", importance: 2, why: "RF for pores/scars" },
        { key: "fraxel", importance: 3, why: "Resurfacing for scars (downtime)" },
      ]);
      break;
    case "pores":
      addUnique(out, [
        { key: "genesis", importance: 1, why: "Refines pores and texture" },
        { key: "secret", importance: 2, why: "Microneedling RF for pores" },
        { key: "potenza", importance: 2, why: "RF tightening for pores" },
      ]);
      break;
    case "redness":
      addUnique(out, [
        { key: "v_beam", importance: 1, why: "Vascular laser for redness" },
        { key: "exel_v", importance: 2, why: "Alternative vascular laser" },
        { key: "genesis", importance: 2, why: "Adjunct for diffuse redness" },
      ]);
      break;
    case "uneven_tone":
      addUnique(out, [
        { key: "toning", importance: 1, why: "Improves uneven pigmentation/tone" },
        { key: "genesis", importance: 2, why: "Supports texture and microcirculation" },
        { key: "repot_or_toning_and_genesis", importance: 3, why: "Light package for tone/texture" },
      ]);
      break;
    case "sagging":
      addUnique(out, [
        { key: "ulthera_400", importance: 1, why: "HIFU lifting for laxity" },
        { key: "thermage_600", importance: 1, why: "RF tightening for firmness" },
        { key: "liftera_400", importance: 2, why: "Cost-effective lifting option" },
        { key: "scultra", importance: 2, why: "Collagen stimulation for firmness" },
      ]);
      break;
    case "elasticity":
      addUnique(out, [
        { key: "thermage_600", importance: 1, why: "Enhances elasticity via RF" },
        { key: "liftera_400", importance: 2, why: "Affordable lifting for elasticity" },
        { key: "oligio_600", importance: 2, why: "RF for skin tightening" },
        { key: "scultra", importance: 2, why: "Collagen biostimulator" },
      ]);
      break;
    case "doublie_chin":
    case "double_chin":
      addUnique(out, [
        { key: "tune_liner", importance: 1, why: "Injection lipolysis for jawline" },
        { key: "ulthera_200", importance: 1, why: "Localized HIFU for jawline lift" },
        { key: "onda", importance: 2, why: "Body RF for adiposity/fat" },
      ]);
      break;
    case "volumizing":
      addUnique(out, [{ key: "filler", importance: 1, why: "Restores lost volume" }]);
      break;
    case "wrinkles":
      addUnique(out, [
        { key: "botox", importance: 1, why: "Dynamic wrinkle reduction" },
        { key: "fraxel", importance: 2, why: "Resurfacing for fine lines" },
        { key: "skinbooster_ha", importance: 2, why: "Hydration for fine lines/glow" },
      ]);
      break;
    case "dryness_glow":
      addUnique(out, [
        { key: "skinbooster-rejuran", importance: 1, why: "Regeneration and hydration for glow" },
        { key: "skinbooster_ha", importance: 1, why: "HA hydration for dewy skin" },
        { key: "exosome", importance: 2, why: "Adjunct for skin regeneration" },
      ]);
      break;
    case "pigmentation":
    case "pigmentation-freckles":
    case "pigmentation-sun-damage":
    case "pigmentation-melasma":
    case "pigmentation-lentigo":
    case "pigmentation-not-sure":
    case "pigmentation-moles":
      if (id === "pigmentation" || id === "pigmentation-not-sure" || id === "pigmentation-freckles" || id === "pigmentation-sun-damage" || id === "pigmentation-melasma" || id === "pigmentation-lentigo") {
        addUnique(out, [
          { key: "toning", importance: 1, why: "Laser toning for pigmentation" },
          { key: "genesis", importance: 2, why: "Texture/vascular support" },
        ]);
      }
      if (id === "pigmentation" && subOptions.includes("moles")) {
        addUnique(out, [{ key: "co2", importance: 1, why: "CO2 ablation for benign lesions/moles" }]);
      }
      if (id === "pigmentation-moles") {
        addUnique(out, [{ key: "co2", importance: 1, why: "CO2 ablation for moles" }]);
      }
      break;
    case "scars":
    case "scar-rough":
    case "scar-red":
    case "scar-brown":
      if (id === "scar-red") addUnique(out, [{ key: "v_beam", importance: 1, why: "Improves erythematous scars" }]);
      if (id === "scar-brown") addUnique(out, [{ key: "toning", importance: 1, why: "Improves hyperpigmented scars" }]);
      if (id === "scars" || id === "scar-rough") {
        addUnique(out, [
          { key: "fraxel", importance: 1, why: "Fractional laser for depressed scars" },
          { key: "secret", importance: 2, why: "Microneedling RF for scars" },
          { key: "potenza", importance: 2, why: "RF microneedling for scars" },
          { key: "juvelook", importance: 3, why: "Collagen induction for scars" },
        ]);
      }
      break;
    case "filler":
    case "filler-forehead":
    case "filler-jawline":
    case "filler-cheeks":
    case "filler-under-eyes":
    case "filler-body":
      addUnique(out, [{ key: "filler", importance: 1, why: "Area-specific volume restoration" }]);
      break;
    case "other":
    default:
      break;
  }

  return out;
}

///////////////////////////////
// 목표 → 기본 후보 매핑
///////////////////////////////

function baseCandidatesByGoal(goal: RecommendInputs["treatmentGoals"][number]): Candidate[] {
  const out: Candidate[] = [];
  switch (goal) {
    case "overall_refresh":
      addUnique(out, [
        { key: "repot_or_toning_and_genesis", importance: 1, why: "Overall tone/texture refresh" },
        { key: "skinbooster_ha", importance: 2, why: "Hydration and glow" },
      ]);
      break;
    case "lifting_firmness":
      addUnique(out, [
        { key: "ulthera_400", importance: 1, why: "HIFU lifting for contour" },
        { key: "thermage_600", importance: 1, why: "RF tightening for firmness" },
        { key: "liftera_400", importance: 2, why: "Value option for lifting" },
        { key: "scultra", importance: 2, why: "Collagen stimulation" },
      ]);
      break;
    case "texture_tone":
      addUnique(out, [
        { key: "genesis", importance: 1, why: "Texture refinement" },
        { key: "toning", importance: 1, why: "Tone/pigment balance" },
        { key: "fraxel", importance: 2, why: "Resurfacing for stubborn texture" },
      ]);
      break;
    case "anti_aging":
      addUnique(out, [
        { key: "botox", importance: 1, why: "Dynamic wrinkles" },
        { key: "ulthera_400", importance: 1, why: "Lifting for sagging" },
        { key: "skinbooster-rejuran", importance: 2, why: "Regeneration + hydration" },
      ]);
      break;
    case "acne_pore":
      addUnique(out, [
        { key: "capri", importance: 1, why: "Acne and sebaceous control" },
        { key: "genesis", importance: 1, why: "Pore refinement" },
        { key: "potenza", importance: 2, why: "RF microneedling for pores/scars" },
      ]);
      break;
    case "recommendation":
      addUnique(out, [
        { key: "repot_or_toning_and_genesis", importance: 1, why: "Balanced entry package" },
        { key: "skinbooster_ha", importance: 2, why: "Hydration and glow" },
      ]);
      break;
  }
  return out;
}

///////////////////////////////
// 연령대/성별 가중치 (효과 우선)
///////////////////////////////

const AGE_PREFERRED_TREATMENTS: Record<AgeGroup, TreatmentKey[]> = {
  teens: ["toning","capri","v_beam"],
  "20s": ["genesis","exosome","skinbooster-rejuran","skinbooster_ha","skinbooster_juvelook"],
  "30s": ["skinbooster-rejuran","skinbooster_ha","skinbooster_juvelook","liftera_400","juvelook"],
  "40s": ["ulthera_400","thermage_600","filler"],
  "50s": ["ulthera_400","thermage_600","filler"],
  "60s": ["ulthera_600","ulthera_800","thermage_900"],
  "70_plus": ["ulthera_600","ulthera_800","thermage_900"],
};

const GENDER_PREFERRED_TREATMENTS: Record<Gender, TreatmentKey[]> = {
  male: ["capri","genesis","secret","potenza","filler","scultra"],
  female: ["ulthera_400","thermage_600","liftera_400","toning","skinbooster-rejuran","skinbooster_ha","exosome"],
  non_binary: [],
  no_answer: [],
};

// 중요도 상향
function adjustCandidatesByAgeGroup(cands: Candidate[], ageGroup?: AgeGroup): Candidate[] {
  if (!ageGroup) return cands;
  const preferred = new Set(AGE_PREFERRED_TREATMENTS[ageGroup] || []);
  const ageLabel: Record<AgeGroup,string> = {
    teens:"teens","20s":"20s","30s":"30s","40s":"40s","50s":"50s","60s":"60s","70_plus":"70+"
  };
  return cands.map(c => preferred.has(c.key)
    ? { ...c, importance: 1, why: `${c.why} (preferred for ${ageLabel[ageGroup]})` }
    : c
  );
}
function adjustCandidatesByGender(cands: Candidate[], gender?: Gender): Candidate[] {
  if (!gender) return cands;
  const preferred = new Set(GENDER_PREFERRED_TREATMENTS[gender] || []);
  const note = gender === "male" ? "male-preferred" : gender === "female" ? "female-preferred" : "";
  return cands.map(c => preferred.has(c.key)
    ? { ...c, importance: 1, why: note ? `${c.why} (${note})` : c.why }
    : c
  );
}

///////////////////////////////
// 부위 필터
///////////////////////////////

function filterByArea(cands: Candidate[], areas: AreaId[], excluded: ExcludedItem[]): Candidate[] {
  const out: Candidate[] = [];
  for (const c of cands) {
    if (inAreas(c.key, areas)) out.push(c);
    else excluded.push({ key: c.key, label: META[c.key].label, reason: "Not relevant to selected area" });
  }
  return out;
}

///////////////////////////////
// 우선순위 기반 치환/제거
///////////////////////////////

function substituteForPriority(
  list: Candidate[],
  priority: PriorityId,
  substitutions: Substitution[],
  excluded: ExcludedItem[],
): Candidate[] {
  let arr = [...list];
  const has = (k: TreatmentKey) => arr.find((c) => c.key === k);
  const replace = (from: TreatmentKey, to: TreatmentKey, reason: Substitution["reason"]) => {
    const idx = arr.findIndex((c) => c.key === from);
    if (idx >= 0 && !has(to)) {
      const base = arr[idx];
      arr.splice(idx, 1, { ...base, key: to, why: `${base.why} → substituted due to ${reason}` });
      substitutions.push({ from, to, reason });
    } else if (idx >= 0 && has(to)) {
      const base = arr[idx];
      arr.splice(idx, 1);
      excluded.push({ key: from, label: META[from].label, reason: `Removed to avoid duplication with ${META[to].label}` });
    }
  };

  if (priority === "price") {
    if (has("ulthera_800")) replace("ulthera_800","liftera_800","price");
    if (has("ulthera_600")) replace("ulthera_600","liftera_600","price");
    if (has("ulthera_400")) replace("ulthera_400","liftera_400","price");
    if (has("thermage_900")) replace("thermage_900","sof_wave_300","price");
    if (has("thermage_600")) replace("thermage_600","sof_wave_200","price");
    ["co2","fraxel"].forEach(t => { if (has(t as TreatmentKey)) replace(t as TreatmentKey,"genesis","price"); });
  }

  if (priority === "pain") {
    ["ulthera_800","ulthera_600","ulthera_400","ulthera_200"].forEach(t => {
      if (has(t as TreatmentKey)) replace(t as TreatmentKey,"sof_wave_300","pain");
    });
    ["co2","fraxel","secret","potenza"].forEach(t => {
      if (has(t as TreatmentKey)) replace(t as TreatmentKey,"genesis","pain");
    });
  }

  if (priority === "recoveryTime") {
    ["co2","fraxel"].forEach(t => {
      const idx = arr.findIndex((c) => c.key === (t as TreatmentKey));
      if (idx >= 0) {
        excluded.push({ key: t as TreatmentKey, label: META[t as TreatmentKey].label, reason: "Removed due to downtime priority" });
        arr.splice(idx, 1);
        if (!has("genesis")) arr.push({ key: "genesis", importance: 2, why: "Low-downtime alternative" });
      }
    });
  }

  return arr;
}

///////////////////////////////
// 예산 계산/적용
///////////////////////////////

function budgetUpperKRW(id: BudgetId): number {
  switch (id) {
    case "under-1000": return Math.floor(1000 / getKRWToUSD());
    case "1000-5000": return Math.floor(5000 / getKRWToUSD());
    case "5000-10000": return Math.floor(10000 / getKRWToUSD());
    case "10000-plus":
    case "no_limit":
    case "unsure":
      return Number.POSITIVE_INFINITY;
  }
}

function enforceBudget(
  cands: Candidate[],
  budgetUpper: number,
  substitutions: Substitution[],
  excluded: ExcludedItem[],
  priority: PriorityId,
): Candidate[] {
  const sumKRW = (xs: Candidate[]) => xs.reduce((acc, x) => acc + PRICE_TABLE[x.key], 0);
  let arr = [...cands];
  let total = sumKRW(arr);

  if (total <= budgetUpper) return arr;

  // 1) 중요도 3부터 제거(비싼 것 우선)
  const removable = [...arr].sort((a,b) => (b.importance - a.importance) || (PRICE_TABLE[b.key] - PRICE_TABLE[a.key]));
  for (const c of removable) {
    if (total <= budgetUpper) break;
    if (c.importance > 1) {
      arr = arr.filter(x => x.key !== c.key);
      excluded.push({ key: c.key, label: META[c.key].label, reason: `Budget limit exceeded: removed (priority ${c.importance})` });
      total = sumKRW(arr);
    }
  }
  if (total <= budgetUpper) return arr;

  // 2) 리프팅 계열 단계적 다운스케일 치환
  const present = (keys: TreatmentKey[]) => keys.find((k) => arr.some((c) => c.key === k));
  const tryScaleDown = (order: TreatmentKey[]) => {
    let changed = false;
    for (let i=0;i<order.length;i++) {
      const k = order[i];
      const idx = arr.findIndex(c => c.key === k);
      if (idx >= 0) {
        for (let j=i+1;j<order.length;j++) {
          const alt = order[j];
          if (!arr.find(c => c.key === alt)) {
            const before = arr[idx];
            // 예산 관련 사유는 내부적으로만 추적하고 사용자에게는 표시하지 않음
            // Original reason: ${before.why} → budget-friendly substitution
            arr[idx] = { ...before, key: alt };
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
  if (present(LIFTING_ORDER)) {
    while (total > budgetUpper && tryScaleDown(LIFTING_ORDER)) { /* 반복 치환 */ }
  }

  // 3) 텍스처 강 → 경 치환
  TEXTURE_STRONG.forEach(t => {
    const idx = arr.findIndex(c => c.key === t);
    if (idx >= 0 && total > budgetUpper) {
      const before = arr[idx];
      const alt = TEXTURE_GENTLE.find(g => !arr.find(c => c.key === g)) || "genesis";
      arr[idx] = { ...before, key: alt as TreatmentKey, why: `${before.why} → budget-friendly (gentler option)` };
      substitutions.push({ from: t, to: alt as TreatmentKey, reason: "price" });
      total = sumKRW(arr);
    }
  });

  // 4) 여전히 초과면, 중요도 2까지 비용 큰 순서로 제거
  if (total > budgetUpper) {
    const byCostDesc = [...arr].sort((a,b) => PRICE_TABLE[b.key] - PRICE_TABLE[a.key]);
    for (const c of byCostDesc) {
      if (total <= budgetUpper) break;
      if (c.importance >= 2) {
        arr = arr.filter(x => x.key !== c.key);
        excluded.push({ key: c.key, label: META[c.key].label, reason: "Budget limit exceeded: removed (high cost)" });
        total = sumKRW(arr);
      }
    }
  }

  // 5) 핵심(importance=1)까지 포함 불가 시: 핵심 일부 제거 + 더 저렴한 핵심 대체 시도
  if (total > budgetUpper) {
    // 핵심 중 리프팅 계열이 있으면 LIFTING_ORDER 하향 시도
    const coreLifts = arr.filter(x => x.importance === 1 && LIFTING_ORDER.includes(x.key));
    if (coreLifts.length) {
      while (total > budgetUpper && tryScaleDown(LIFTING_ORDER)) {
        total = sumKRW(arr);
      }
    }
    // 그래도 초과면 핵심 중 비용 큰 것부터 제거(최소 1개는 유지)
    if (total > budgetUpper) {
      const essentials = arr.filter(x => x.importance === 1);
      if (essentials.length > 1) {
        const byCostDesc = essentials.sort((a,b) => PRICE_TABLE[b.key] - PRICE_TABLE[a.key]);
        for (let i=0;i<byCostDesc.length-1 && total>budgetUpper;i++) {
          const c = byCostDesc[i];
          arr = arr.filter(x => x.key !== c.key);
          excluded.push({ key: c.key, label: META[c.key].label, reason: "Budget limit exceeded: reduced core set" });
          total = sumKRW(arr);
        }
      }
    }
  }

  // 6) 최종 안전장치: 아무 것도 남지 않을 경우, 가장 저렴한 후보 1개라도 남김
  if (arr.length === 0) {
    const cheapest: TreatmentKey = (Object.keys(PRICE_TABLE) as TreatmentKey[])
      .sort((a,b) => PRICE_TABLE[a] - PRICE_TABLE[b])[0];
    arr.push({ key: cheapest, importance: 1, why: "Cheapest fallback due to strict budget" });
  }

  return arr;
}

///////////////////////////////
// 과거 시술 필터 (영문 사유 포함)
///////////////////////////////

function applyPastFilters(
  arr: Candidate[],
  past: PastId[],
  excluded: ExcludedItem[],
): Candidate[] {
  let out = [...arr];

  if (past.includes("botox_4m")) {
    if (out.some(c => c.key === "botox")) {
      out = out.filter(c => c.key !== "botox");
      excluded.push({ key: "botox", label: META["botox"].label, reason: "Botox in the last 4 months" });
    }
  }
  if (past.includes("filler_2w")) {
    if (out.some(c => c.key === "filler")) {
      out = out.filter(c => c.key !== "filler");
      excluded.push({ key: "filler", label: META["filler"].label, reason: "Filler in the last 2 weeks" });
    }
  }
  if (past.includes("laser_2w")) {
    const lasers = out.filter(c => isLaser(c.key));
    if (lasers.length) {
      out = out.filter(c => !isLaser(c.key));
      lasers.forEach(l => excluded.push({ key: l.key, label: META[l.key].label, reason: "Laser treatment in the last 2 weeks" }));
    }
  }
  if (past.includes("skinbooster_2w")) {
    const boosters = out.filter(c => c.key.startsWith("skinbooster"));
    if (boosters.length) {
      out = out.filter(c => !c.key.startsWith("skinbooster"));
      boosters.forEach(b => excluded.push({ key: b.key, label: META[b.key].label, reason: "Skinbooster in the last 2 weeks" }));
    }
  }
  if (past.includes("stemcell_1m")) {
    if (out.some(c => c.key === "stem_cell")) {
      out = out.filter(c => c.key !== "stem_cell");
      excluded.push({ key: "stem_cell", label: META["stem_cell"].label, reason: "Stem cell treatment in the last 1 month" });
    }
  }
  // stemcell_1_6m: 재시술 간격 고려(제거하지 않음), 필요 시 가중치 낮추는 로직 추가 가능
  return out;
}

///////////////////////////////
// 의학적 상태 필터 (효과 우선이지만 금기 시술은 제외)
///////////////////////////////

function applyMedicalFilters(
  arr: Candidate[],
  medical: MedicalId[],
  excluded: ExcludedItem[],
  notes: string[],
): Candidate[] {
  let out = [...arr];

  if (medical.includes("pregnant")) {
    const drop = out.filter(c => isInjectable(c.key) || createsWound(c.key));
    if (drop.length) {
      out = out.filter(c => !drop.includes(c));
      drop.forEach(d => excluded.push({ key: d.key, label: META[d.key].label, reason: "Not recommended during pregnancy" }));
    }
    notes.push("During pregnancy, injections and ablative/wound-causing treatments are generally discouraged.");
  }

  if (medical.includes("blood_clotting")) {
    const drop = out.filter(c => isInjectable(c.key));
    if (drop.length) {
      out = out.filter(c => !drop.includes(c));
      drop.forEach(d => excluded.push({ key: d.key, label: META[d.key].label, reason: "Blood clotting disorder: avoid injections" }));
    }
    notes.push("With blood clotting disorders, injections are generally avoided due to bruising/bleeding risk.");
  }

  if (medical.includes("immunosuppressants")) {
    const drop = out.filter(c => createsWound(c.key));
    if (drop.length) {
      out = out.filter(c => !drop.includes(c));
      drop.forEach(d => excluded.push({ key: d.key, label: META[d.key].label, reason: "Immunosuppression: avoid wound-causing treatments" }));
    }
    notes.push("On immunosuppressants, wound-causing treatments increase infection risk and are avoided.");
  }

  if (medical.includes("antibiotics_or_steroids")) {
    notes.push("On antibiotics/steroids: adjust treatment timing/intensity considering healing and infection risk.");
  }
  if (medical.includes("skin_condition")) {
    notes.push("Chronic skin condition: avoid treating active lesions; consult a specialist for concurrent care.");
  }

  return out;
}

///////////////////////////////
// 업셀/대안 제안 (영문)
///////////////////////////////

function buildUpgradeSuggestions(
  excluded: ExcludedItem[],
  subs: Substitution[],
  priority: PriorityId,
  budgetUpper: number,
): string[] {
  const msgs: string[] = [];

  subs.filter(s => s.reason === "price").forEach(s => {
    msgs.push(`If additional budget is available, consider **${META[s.from].label}** (currently substituted with **${META[s.to].label}**).`);
  });

  if (priority === "pain") {
    const painRelated = excluded.filter(e => /pain|통증|substituted/i.test(e.reason));
    if (painRelated.length) {
      msgs.push(`If pain is a concern, strong local anesthesia or sedation can broaden options (e.g., ${painRelated.slice(0,3).map(e => META[e.key].label).join(", ")}).`);
    }
  }

  if (priority === "recoveryTime") {
    const dtRelated = excluded.filter(e => /downtime|다운타임/i.test(e.reason));
    if (dtRelated.length) {
      msgs.push(`If some downtime is tolerable, 1–2 sessions of high-intensity treatments (e.g., ${dtRelated.slice(0,3).map(e => META[e.key].label).join(", ")}) can accelerate results.`);
    }
  }

  const budgetDrops = excluded.filter(e => /Budget limit exceeded/i.test(e.reason));
  if (budgetDrops.length && Number.isFinite(budgetUpper)) {
    msgs.push(`By slightly increasing your budget, you can include excluded treatments (e.g., ${budgetDrops.slice(0,3).map(e => META[e.key].label).join(", ")}) to maximize outcomes.`);
  }

  // 중복 메시지 제거: 동일한 내용의 메시지를 필터링
  // Set을 사용하여 중복된 문자열을 자동으로 제거
  const uniqueMsgs = Array.from(new Set(msgs));
  
  return uniqueMsgs;
}

///////////////////////////////
// 추천 아이템 변환
///////////////////////////////

function toRecommendedItems(cands: Candidate[]): RecommendedItem[] {
  return cands.map(c => {
    const krw = PRICE_TABLE[c.key];
    return {
      key: c.key,
      label: META[c.key].label,
      priceKRW: krw,
      priceUSD: krwToUsdSync(krw),
      rationale: [c.why],
    };
  });
}

///////////////////////////////
// 메인 진입 함수
///////////////////////////////

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
    pastTreatments,
    medicalConditions,
  } = input;

  const excluded: ExcludedItem[] = [];
  const substitutions: Substitution[] = [];
  const notes: string[] = [];

  // 1) 기본 후보 수집
  let candidates: Candidate[] = [];
  skinConcerns.forEach((c) => addUnique(candidates, baseCandidatesByConcern(c)));
  treatmentGoals.forEach((g) => addUnique(candidates, baseCandidatesByGoal(g)));

  // 1.5) 피부타입 영향 (민감성: 통증 높거나 상처 유발은 중요도 하향) — 효과 우선이나 현실적 가이드로 라벨만 남김
  if (skinTypeId === "sensitive") {
    candidates = candidates.map((c) =>
      (META[c.key].createsWound || META[c.key].pain >= 6)
        ? { ...c, importance: (Math.min(3, c.importance + 1) as 1|2|3), why: `${c.why} (note: sensitive skin)` }
        : c
    );
    notes.push("Sensitive skin: consider gentler options if irritation occurs.");
  }

  // 1.6) 연령대/성별 가중치 (효과 중심)
  candidates = adjustCandidatesByAgeGroup(candidates, ageGroup);
  candidates = adjustCandidatesByGender(candidates, gender);

  // 2) 부위 필터
  candidates = filterByArea(candidates, treatmentAreas, excluded);

  // 3) 우선순위 반영 (치환/제거)
  candidates = substituteForPriority(candidates, priorityId, substitutions, excluded);

  // 4) 예산 적용
  const budgetUpper = budgetUpperKRW(budgetRangeId);
  candidates = enforceBudget(candidates, budgetUpper, substitutions, excluded, priorityId);

  // 5) 과거 시술 필터
  candidates = applyPastFilters(candidates, pastTreatments, excluded);

  // 6) 의학적 상태 필터 (금기 제거 + 노트)
  candidates = applyMedicalFilters(candidates, medicalConditions, excluded, notes);

  // 7) 결과 변환/합계
  const recommendations = toRecommendedItems(candidates);
  const totalPriceKRW = recommendations.reduce((acc, r) => acc + r.priceKRW, 0);
  const totalPriceUSD = krwToUsdSync(totalPriceKRW);

  // 8) 업셀/대안
  const upgradeSuggestions = buildUpgradeSuggestions(excluded, substitutions, priorityId, budgetUpper);

  // 9) 추가 노트(최근 레이저 등)
  if (pastTreatments.includes("laser_2w")) notes.push("Laser in the last 2 weeks: defer further laser until recovery.");
  if (pastTreatments.includes("skinbooster_2w")) notes.push("Recent skinbooster: spacing sessions helps minimize adverse events.");

  // 10) 반환
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

///////////////////////////////
// 사용 예시 (주석 처리)
// const demo = recommendTreatments({
//   skinTypeId: "combination",
//   ageGroup: "40s",
//   gender: "female",
//   skinConcerns: [{ id: "sagging" }, { id: "wrinkles" }, { id: "pigmentation" }],
//   treatmentGoals: ["lifting_firmness","anti_aging"],
//   treatmentAreas: ["full-face","jawline"],
//   budgetRangeId: "1000-5000",
//   priorityId: "effectiveness",
//   pastTreatments: ["none"],
//   medicalConditions: ["none"],
// });
// log.debug(JSON.stringify(demo, null, 2));
