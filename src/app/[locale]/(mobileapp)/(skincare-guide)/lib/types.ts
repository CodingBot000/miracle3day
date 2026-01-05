/**
 * Skincare Guide Types
 */

export interface UserCondition {
  ageGroup: string;
  skinType: string;
  concerns: string[];
  gender?: string;
}

export interface OnboardingData {
  id_uuid?: string;
  age_group?: string;
  skin_type?: string;
  skin_concerns?: string[];
  gender?: string;
  fitzpatrick_type?: number;
  country_code?: string;
  region?: string;
}

// Age mapping for JSON data
export const AGE_MAPPING: Record<string, string> = {
  '20s': 'skincare-20s',
  '30s': 'skincare-20s', // 30대는 20대 가이드 참고
  '40s': 'skincare-40s-50s',
  '50s': 'skincare-40s-50s',
  '40s-50s': 'skincare-40s-50s',
  '60s': 'skincare-60s-70s',
  '70s': 'skincare-60s-70s',
  '60s+': 'skincare-60s-70s',
};

// Display labels
export const AGE_LABELS: Record<string, { ko: string; en: string }> = {
  '20s': { ko: '20대', en: '20s' },
  '30s': { ko: '30대', en: '30s' },
  '40s-50s': { ko: '40-50대', en: '40s-50s' },
  '60s+': { ko: '60대 이상', en: '60s+' },
};

export const SKIN_TYPE_LABELS: Record<string, { ko: string; en: string }> = {
  dry: { ko: '건성', en: 'Dry' },
  oily: { ko: '지성', en: 'Oily' },
  combination: { ko: '복합성', en: 'Combination' },
  sensitive: { ko: '민감성', en: 'Sensitive' },
  normal: { ko: '중성', en: 'Normal' },
};

export const CONCERN_LABELS: Record<string, { ko: string; en: string }> = {
  acne: { ko: '여드름', en: 'Acne' },
  wrinkles: { ko: '주름', en: 'Wrinkles' },
  'fine-lines': { ko: '잔주름', en: 'Fine Lines' },
  'dark-spots': { ko: '기미/잡티', en: 'Dark Spots' },
  pores: { ko: '모공', en: 'Pores' },
  dryness: { ko: '건조함', en: 'Dryness' },
  oiliness: { ko: '유분', en: 'Oiliness' },
  sensitivity: { ko: '민감함', en: 'Sensitivity' },
  dullness: { ko: '칙칙함', en: 'Dullness' },
  redness: { ko: '홍조', en: 'Redness' },
  'uneven-texture': { ko: '피부결', en: 'Uneven Texture' },
};

// Selection options
export const AGE_OPTIONS = ['20s', '30s', '40s-50s', '60s+'];
export const SKIN_TYPE_OPTIONS = ['dry', 'oily', 'combination', 'sensitive', 'normal'];
export const CONCERN_OPTIONS = [
  'acne',
  'wrinkles',
  'fine-lines',
  'dark-spots',
  'pores',
  'dryness',
  'oiliness',
  'sensitivity',
  'dullness',
  'redness',
];
