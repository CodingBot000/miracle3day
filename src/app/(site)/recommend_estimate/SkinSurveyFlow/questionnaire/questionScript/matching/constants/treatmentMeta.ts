import { TreatmentKey, TreatmentMeta, AreaId } from '@/app/(site)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/types';

/**
 * 공통 얼굴 영역
 */
const FACE_AREAS: AreaId[] = [
  "full-face",
  "forehead",
  "eye-area",
  "cheeks",
  "jawline",
  "neck",
  "upper-face",   // 신규
  "mid-face",     // 신규
  "lower-face"    // 신규
];

/**
 * 시술별 메타데이터
 * 기존 matchingDiagnosis.ts의 META 객체를 그대로 이동
 */
export const META: Record<TreatmentKey, TreatmentMeta> = {
  botox: {
    key: "botox",
    label: "botox",
    category: "injectable",
    pain: 2,
    effectiveness: 8,
    downtime: 1,
    areas: ["forehead", "eye-area", "jawline", "full-face"],
    isInjectable: true,
    equivalenceGroup: "texture"
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
    equivalenceGroup: "acne"
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
    equivalenceGroup: "texture"
  },
  density_600: {
    key: "density_600",
    label: "density",
    category: "ultrasound",
    pain: 6,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
  },
  density_900: {
    key: "density_900",
    label: "density",
    category: "ultrasound",
    pain: 6,
    effectiveness: 9,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
  },
  exel_v: {
    key: "exel_v",
    label: "exel v",
    category: "laser",
    pain: 4,
    effectiveness: 7,
    downtime: 2,
    areas: FACE_AREAS,
    isLaser: true,
    equivalenceGroup: "vascular"
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
    equivalenceGroup: "hydration"
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
    equivalenceGroup: "volume"
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
    equivalenceGroup: "texture"
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
    equivalenceGroup: "texture"
  },
  inmode: {
    key: "inmode",
    label: "inmode",
    category: "rf",
    pain: 4,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS.concat(["body"]),
    equivalenceGroup: "lifting"
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
    equivalenceGroup: "hydration"
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
    equivalenceGroup: "scars"
  },
  liftera_200: {
    key: "liftera_200",
    label: "liftera",
    category: "ultrasound",
    pain: 5,
    effectiveness: 6,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
  },
  liftera_400: {
    key: "liftera_400",
    label: "liftera",
    category: "ultrasound",
    pain: 5,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
  },
  liftera_600: {
    key: "liftera_600",
    label: "liftera",
    category: "ultrasound",
    pain: 5,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
  },
  liftera_800: {
    key: "liftera_800",
    label: "liftera",
    category: "ultrasound",
    pain: 5,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
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
    equivalenceGroup: "texture"
  },
  oligio_600: {
    key: "oligio_600",
    label: "oligio",
    category: "rf",
    pain: 5,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
  },
  oligio_900: {
    key: "oligio_900",
    label: "oligio",
    category: "rf",
    pain: 5,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
  },
  onda: {
    key: "onda",
    label: "onda",
    category: "rf",
    pain: 4,
    effectiveness: 7,
    downtime: 1,
    areas: ["body", "jawline"],
    equivalenceGroup: "body"
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
    equivalenceGroup: "texture"
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
    equivalenceGroup: "texture"
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
    equivalenceGroup: "texture"
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
    equivalenceGroup: "volume"
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
    equivalenceGroup: "texture"
  },
  shrink_200: {
    key: "shrink_200",
    label: "shrink",
    category: "ultrasound",
    pain: 5,
    effectiveness: 5,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
  },
  shrink_400: {
    key: "shrink_400",
    label: "shrink",
    category: "ultrasound",
    pain: 5,
    effectiveness: 6,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
  },
  shrink_600: {
    key: "shrink_600",
    label: "shrink",
    category: "ultrasound",
    pain: 5,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
  },
  shrink_800: {
    key: "shrink_800",
    label: "shrink",
    category: "ultrasound",
    pain: 5,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
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
    equivalenceGroup: "hydration"
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
    equivalenceGroup: "hydration"
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
    equivalenceGroup: "hydration"
  },
  sof_wave_200: {
    key: "sof_wave_200",
    label: "sof wave",
    category: "ultrasound",
    pain: 4,
    effectiveness: 7,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
  },
  sof_wave_300: {
    key: "sof_wave_300",
    label: "sof wave",
    category: "ultrasound",
    pain: 4,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS,
    equivalenceGroup: "lifting"
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
    equivalenceGroup: "hydration"
  },
  thermage_600: {
    key: "thermage_600",
    label: "thermage",
    category: "rf",
    pain: 5,
    effectiveness: 8,
    downtime: 1,
    areas: FACE_AREAS.concat(["body"]),
    equivalenceGroup: "lifting"
  },
  thermage_900: {
    key: "thermage_900",
    label: "thermage",
    category: "rf",
    pain: 5,
    effectiveness: 9,
    downtime: 1,
    areas: FACE_AREAS.concat(["body"]),
    equivalenceGroup: "lifting"
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
    equivalenceGroup: "pigment"
  },
  tune_face: {
    key: "tune_face",
    label: "tune face",
    category: "rf",
    pain: 5,
    effectiveness: 7,
    downtime: 1,
    areas: ["jawline", "full-face"],
    equivalenceGroup: "jawline"
  },
  tune_liner: {
    key: "tune_liner",
    label: "tune liner",
    category: "injectable",
    pain: 4,
    effectiveness: 7,
    downtime: 2,
    areas: ["jawline"],
    isInjectable: true,
    equivalenceGroup: "jawline"
  },
  ulthera_200: {
    key: "ulthera_200",
    label: "ulthera",
    category: "ultrasound",
    pain: 7,
    effectiveness: 7,
    downtime: 1,
    areas: ["jawline", "neck", "full-face", "forehead", "cheeks"],
    equivalenceGroup: "lifting"
  },
  ulthera_400: {
    key: "ulthera_400",
    label: "ulthera",
    category: "ultrasound",
    pain: 7,
    effectiveness: 9,
    downtime: 1,
    areas: ["jawline", "neck", "full-face", "forehead", "cheeks"],
    equivalenceGroup: "lifting"
  },
  ulthera_600: {
    key: "ulthera_600",
    label: "ulthera",
    category: "ultrasound",
    pain: 7,
    effectiveness: 9,
    downtime: 1,
    areas: ["jawline", "neck", "full-face", "forehead", "cheeks"],
    equivalenceGroup: "lifting"
  },
  ulthera_800: {
    key: "ulthera_800",
    label: "ulthera",
    category: "ultrasound",
    pain: 7,
    effectiveness: 10,
    downtime: 1,
    areas: ["jawline", "neck", "full-face", "forehead", "cheeks"],
    equivalenceGroup: "lifting"
  },
  v_beam: {
    key: "v_beam",
    label: "v beam",
    category: "laser",
    pain: 4,
    effectiveness: 7,
    downtime: 2,
    areas: FACE_AREAS,
    isLaser: true,
    equivalenceGroup: "vascular"
  },
};

/**
 * 등가/대체 관계 목록
 */
export const LIFTING_ORDER: TreatmentKey[] = [
  "ulthera_800", "ulthera_600", "ulthera_400",
  "thermage_900", "thermage_600",
  "sof_wave_300", "sof_wave_200",
  "density_900", "density_600",
  "liftera_800", "liftera_600", "liftera_400", "liftera_200",
  "shrink_800", "shrink_600", "shrink_400", "shrink_200",
  "inmode",
];

export const TEXTURE_STRONG: TreatmentKey[] = ["co2", "fraxel", "potenza", "secret"];
export const TEXTURE_GENTLE: TreatmentKey[] = ["genesis", "neobeam", "repot_or_toning_and_genesis"];
export const VASCULAR_ORDER: TreatmentKey[] = ["v_beam", "exel_v", "genesis"];
export const PIGMENT_ORDER: TreatmentKey[] = ["toning", "genesis"];
export const HYDRATION_ORDER: TreatmentKey[] = ["skinbooster-rejuran", "skinbooster_juvelook", "skinbooster_ha", "exosome", "stem_cell"];
export const VOLUME_ORDER: TreatmentKey[] = ["filler", "scultra"];
export const ACNE_ORDER: TreatmentKey[] = ["capri", "genesis", "v_beam"];
export const SCAR_ORDER: TreatmentKey[] = ["fraxel", "secret", "potenza", "juvelook"];
