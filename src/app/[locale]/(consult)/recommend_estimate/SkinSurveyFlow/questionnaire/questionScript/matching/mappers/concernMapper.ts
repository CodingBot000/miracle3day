import { SelectedConcern, Candidate, ConcernId } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/types';
import { expandConcernId } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/utils/compatibility';

/**
 * Concern → Candidate 매핑
 * 기존 baseCandidatesByConcern 함수를 개선한 버전
 */
export function mapConcernToCandidates(concern: SelectedConcern): Candidate[] {
  const candidates: Candidate[] = [];
  const expandedIds = expandConcernId(concern.id);
  const tier = concern.tier as 1 | 2 | 3 | undefined;

  expandedIds.forEach(id => {
    const mapped = CONCERN_TO_TREATMENTS[id];
    if (mapped) {
      candidates.push(...mapped.map(c => ({ ...c, tier })));
    }
  });

  // subOptions 처리 (pigmentation-moles 등)
  if (concern.subOptions && concern.subOptions.length > 0) {
    concern.subOptions.forEach(subOpt => {
      if (subOpt === "moles" && concern.id === "pigmentation") {
        candidates.push({ key: "co2", importance: 1, why: "CO2 ablation for benign lesions/moles", tier });
      }
    });
  }

  return candidates;
}

/**
 * Concern ID → Treatment 매핑 테이블
 * 기존 matchingDiagnosis.ts의 baseCandidatesByConcern 로직을 테이블로 변환
 */
const CONCERN_TO_TREATMENTS: Record<ConcernId, Omit<Candidate, 'tier'>[]> = {
  // ═══ TIER 1: Skin Conditions ═══
  "acne": [
    { key: "capri", importance: 1, why: "Targets inflammatory acne and sebum control" },
    { key: "genesis", importance: 2, why: "Supports oil control and texture" },
    { key: "secret", importance: 2, why: "Microneedling RF for acne scarring/texture" },
    { key: "potenza", importance: 2, why: "RF for acne scars and pores" },
    { key: "fraxel", importance: 3, why: "Fractional resurfacing for scars (downtime)" },
  ],
  "acne-inflammatory": [
    { key: "capri", importance: 1, why: "Inflammatory acne" },
    { key: "genesis", importance: 2, why: "Supports oil control and texture" },
    { key: "secret", importance: 2, why: "Microneedling RF for acne scarring/texture" },
    { key: "potenza", importance: 2, why: "RF for acne scars and pores" },
    { key: "fraxel", importance: 3, why: "Fractional resurfacing for scars (downtime)" },
  ],
  "acne-whiteheads": [
    { key: "genesis", importance: 1, why: "Improves comedones and texture" },
    { key: "capri", importance: 2, why: "Assists acne clearance" },
    { key: "secret", importance: 2, why: "Microneedling RF for texture" },
    { key: "potenza", importance: 2, why: "RF for pores/scars" },
    { key: "fraxel", importance: 3, why: "Resurfacing for scars (downtime)" },
  ],

  "pigmentation": [
    { key: "toning", importance: 1, why: "Laser toning for pigmentation" },
    { key: "genesis", importance: 2, why: "Texture/vascular support" },
  ],
  "pigmentation-freckles": [
    { key: "toning", importance: 1, why: "Freckle reduction" },
  ],
  "pigmentation-sun-damage": [
    { key: "fraxel", importance: 1, why: "Sun damage repair" },
  ],
  "pigmentation-melasma": [
    { key: "toning", importance: 1, why: "Melasma treatment" },
    { key: "exosome", importance: 2, why: "Brighten melasma" },
  ],
  "pigmentation-lentigo": [
    { key: "toning", importance: 1, why: "Lentigo treatment" },
    { key: "genesis", importance: 2, why: "Texture/vascular support" },
  ],
  "pigmentation-not-sure": [
    { key: "toning", importance: 1, why: "General pigmentation treatment" },
    { key: "genesis", importance: 2, why: "Texture/vascular support" },
  ],
  "pigmentation-moles": [
    { key: "co2", importance: 1, why: "CO2 ablation for moles" },
  ],

  "pores": [
    { key: "genesis", importance: 1, why: "Refines pores and texture" },
    { key: "secret", importance: 2, why: "Microneedling RF for pores" },
    { key: "potenza", importance: 2, why: "RF tightening for pores" },
  ],

  "redness": [
    { key: "v_beam", importance: 1, why: "Vascular laser for redness" },
    { key: "exel_v", importance: 2, why: "Alternative vascular laser" },
    { key: "genesis", importance: 2, why: "Adjunct for diffuse redness" },
  ],

  "scars": [
    { key: "fraxel", importance: 1, why: "Fractional laser for depressed scars" },
    { key: "secret", importance: 2, why: "Microneedling RF for scars" },
    { key: "potenza", importance: 2, why: "RF microneedling for scars" },
    { key: "juvelook", importance: 3, why: "Collagen induction for scars" },
  ],
  "scar-red": [
    { key: "v_beam", importance: 1, why: "Improves erythematous scars" },
  ],
  "scar-brown": [
    { key: "toning", importance: 1, why: "Improves hyperpigmented scars" },
  ],
  "scar-rough": [
    { key: "co2", importance: 1, why: "Smooth rough scars" },
    { key: "fraxel", importance: 2, why: "Fractional laser for depressed scars" },
    { key: "secret", importance: 2, why: "Microneedling RF for scars" },
  ],

  "dryness": [
    { key: "skinbooster_ha", importance: 1, why: "Deep hydration" },
    { key: "exosome", importance: 2, why: "Restore radiance" },
  ],
  "dryness_glow": [
    { key: "skinbooster-rejuran", importance: 1, why: "Regeneration and hydration for glow" },
    { key: "skinbooster_ha", importance: 1, why: "HA hydration for dewy skin" },
    { key: "exosome", importance: 2, why: "Adjunct for skin regeneration" },
  ],

  "uneven_tone": [
    { key: "toning", importance: 1, why: "Improves uneven pigmentation/tone" },
    { key: "genesis", importance: 2, why: "Supports texture and microcirculation" },
    { key: "repot_or_toning_and_genesis", importance: 3, why: "Light package for tone/texture" },
  ],

  // ═══ TIER 2: Anti-Aging ═══
  "wrinkles": [
    { key: "botox", importance: 1, why: "Dynamic wrinkle reduction" },
    { key: "fraxel", importance: 2, why: "Resurfacing for fine lines" },
    { key: "skinbooster_ha", importance: 2, why: "Hydration for fine lines/glow" },
  ],

  "sagging": [
    { key: "ulthera_400", importance: 1, why: "HIFU lifting for laxity" },
    { key: "thermage_600", importance: 1, why: "RF tightening for firmness" },
    { key: "liftera_400", importance: 2, why: "Cost-effective lifting option" },
    { key: "scultra", importance: 2, why: "Collagen stimulation for firmness" },
  ],

  "volume_loss": [
    { key: "filler", importance: 1, why: "Volume restoration" },
    { key: "scultra", importance: 2, why: "Natural volume building" },
  ],
  "volumizing": [
    { key: "filler", importance: 1, why: "Add facial volume" },
  ],

  "elasticity": [
    { key: "thermage_600", importance: 1, why: "Enhances elasticity via RF" },
    { key: "liftera_400", importance: 2, why: "Affordable lifting for elasticity" },
    { key: "oligio_600", importance: 2, why: "RF for skin tightening" },
    { key: "scultra", importance: 2, why: "Collagen biostimulator" },
  ],

  // ═══ TIER 3: Contouring (신규) ═══
  "jawline_enhancement": [
    { key: "filler", importance: 1, why: "Jawline definition" },
    { key: "botox", importance: 2, why: "Jaw slimming effect" },
  ],
  "filler-jawline": [
    { key: "filler", importance: 1, why: "Jawline filler" },
  ],

  "nose_enhancement": [
    { key: "filler", importance: 1, why: "Non-surgical rhinoplasty" },
  ],

  "lip_enhancement": [
    { key: "filler", importance: 1, why: "Lip volume & shape" },
  ],

  "double_chin": [
    { key: "tune_liner", importance: 1, why: "Injection lipolysis for jawline" },
    { key: "ulthera_200", importance: 1, why: "Localized HIFU for jawline lift" },
    { key: "onda", importance: 2, why: "Body RF for adiposity/fat" },
  ],
  "doublie_chin": [  // 오타 호환
    { key: "tune_liner", importance: 1, why: "Injection lipolysis for jawline" },
    { key: "ulthera_200", importance: 1, why: "Localized HIFU for jawline lift" },
    { key: "onda", importance: 2, why: "Chin fat reduction" },
  ],

  "cheek_contouring": [
    { key: "filler", importance: 1, why: "Cheek volume enhancement" },
    { key: "scultra", importance: 2, why: "Natural cheek lift" },
  ],
  "filler-cheeks": [
    { key: "filler", importance: 1, why: "Cheek filler" },
  ],

  "forehead_contouring": [
    { key: "filler", importance: 1, why: "Forehead shape improvement" },
    { key: "botox", importance: 2, why: "Forehead smoothing" },
  ],
  "filler-forehead": [
    { key: "filler", importance: 1, why: "Forehead filler" },
  ],

  "filler-under-eyes": [
    { key: "filler", importance: 1, why: "Under-eye filler" },
  ],
  "filler-body": [
    { key: "filler", importance: 1, why: "Body filler" },
  ],

  // ═══ 기타 ═══
  "filler": [
    { key: "filler", importance: 1, why: "Area-specific volume restoration" },
  ],
  "other": [],
};
