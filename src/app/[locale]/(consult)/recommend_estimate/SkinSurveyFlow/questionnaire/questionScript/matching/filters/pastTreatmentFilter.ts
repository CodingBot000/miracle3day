import { Candidate, PastId, ExcludedItem } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/types';
import { isLaser } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/utils/helpers';
import { META } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/constants/treatmentMeta';

/**
 * 과거 시술 필터 (영문 사유 포함)
 * 기존 applyPastFilters 함수를 그대로 이동
 */
export function applyPastFilters(
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
