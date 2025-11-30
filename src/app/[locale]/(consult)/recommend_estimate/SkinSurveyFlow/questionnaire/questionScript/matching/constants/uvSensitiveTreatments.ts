import { TreatmentKey, Category } from '../types';

/**
 * UV에 민감한 시술 카테고리
 */
export const UV_SENSITIVE_CATEGORIES: Category[] = [
  'laser',  // 레이저 시술
];

/**
 * UV에 민감한 특정 시술 ID
 * 카테고리와 별개로 개별 지정이 필요한 시술
 */
export const UV_SENSITIVE_TREATMENT_IDS: TreatmentKey[] = [
  // 레이저 계열
  'co2',
  'fraxel',
  'toning',
  'genesis',
  'capri',
  'exel_v',
  'v_beam',
  'neobeam',
  // 마이크로니들링/RF 계열 (상처 유발)
  'secret',
  'potenza',
];

/**
 * UV에 민감하지 않은 시술 (예외 처리)
 * 레이저 카테고리지만 UV 영향이 적은 시술
 */
export const UV_SAFE_TREATMENT_IDS: TreatmentKey[] = [
  // RF 기반은 UV 영향 적음
  'thermage_600',
  'thermage_900',
  'oligio_600',
  'oligio_900',
  'inmode',
  'onda',
  // 초음파 기반
  'ulthera_200',
  'ulthera_400',
  'ulthera_600',
  'ulthera_800',
  'liftera_200',
  'liftera_400',
  'liftera_600',
  'liftera_800',
  'sof_wave_200',
  'sof_wave_300',
  'shrink_200',
  'shrink_400',
  'shrink_600',
  'shrink_800',
  'density_600',
  'density_900',
  'tune_face',
  'tune_liner',
];

/**
 * 시술이 UV에 민감한지 확인
 */
export function isUVSensitiveTreatment(
  treatmentKey: TreatmentKey,
  category?: Category,
  isLaser?: boolean,
  createsWound?: boolean
): boolean {
  // 1. UV-safe 목록에 있으면 false
  if (UV_SAFE_TREATMENT_IDS.includes(treatmentKey)) {
    return false;
  }

  // 2. 특정 UV-sensitive 시술 ID 확인
  if (UV_SENSITIVE_TREATMENT_IDS.includes(treatmentKey)) {
    return true;
  }

  // 3. 레이저 시술이면 기본적으로 UV-sensitive
  if (isLaser) {
    return true;
  }

  // 4. 상처를 만드는 시술은 UV-sensitive
  if (createsWound) {
    return true;
  }

  // 5. 카테고리 기반 확인
  if (category && UV_SENSITIVE_CATEGORIES.includes(category)) {
    return true;
  }

  return false;
}
