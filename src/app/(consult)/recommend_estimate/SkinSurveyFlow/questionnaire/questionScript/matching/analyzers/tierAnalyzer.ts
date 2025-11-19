import { SelectedConcern, TierAnalysis } from '@/app/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/types';

/**
 * 선택된 concerns의 tier 분포 분석 (신규 기능)
 */
export function analyzeTiers(concerns: SelectedConcern[]): TierAnalysis {
  const tier1 = concerns.filter(c => c.tier === 1 || isTier1Concern(c.id));
  const tier2 = concerns.filter(c => c.tier === 2 || isTier2Concern(c.id));
  const tier3 = concerns.filter(c => c.tier === 3 || isTier3Concern(c.id));

  return {
    hasTier1: tier1.length > 0,
    hasTier2: tier2.length > 0,
    hasTier3: tier3.length > 0,
    tier1Count: tier1.length,
    tier2Count: tier2.length,
    tier3Count: tier3.length,
  };
}

/**
 * Tier 1 (피부 고민) 판별
 */
function isTier1Concern(id: string): boolean {
  const tier1Ids = [
    "acne", "acne-inflammatory", "acne-whiteheads",
    "pigmentation", "pigmentation-freckles", "pigmentation-melasma",
    "pigmentation-sun-damage", "pigmentation-lentigo", "pigmentation-not-sure", "pigmentation-moles",
    "pores", "redness", "scars", "scar-red", "scar-brown", "scar-rough",
    "dryness", "dryness_glow", "uneven_tone",
  ];
  return tier1Ids.includes(id);
}

/**
 * Tier 2 (에이징) 판별
 */
function isTier2Concern(id: string): boolean {
  const tier2Ids = [
    "wrinkles", "sagging", "volume_loss", "volumizing", "elasticity",
  ];
  return tier2Ids.includes(id);
}

/**
 * Tier 3 (성형) 판별
 */
function isTier3Concern(id: string): boolean {
  const tier3Ids = [
    "jawline_enhancement", "nose_enhancement", "lip_enhancement",
    "double_chin", "doublie_chin", "cheek_contouring", "forehead_contouring",
    "filler-jawline", "filler-cheeks", "filler-forehead", "filler-under-eyes", "filler-body",
  ];
  return tier3Ids.includes(id);
}
