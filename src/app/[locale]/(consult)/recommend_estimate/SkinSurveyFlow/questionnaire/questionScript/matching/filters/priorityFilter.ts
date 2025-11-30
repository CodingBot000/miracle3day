import { Candidate, PriorityId, Substitution, ExcludedItem, TreatmentKey } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/types';
import { META } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/constants/treatmentMeta';

/**
 * 우선순위 기반 치환/제거
 * 기존 substituteForPriority 함수를 그대로 이동
 */
export function substituteForPriority(
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
    if (has("ulthera_800")) replace("ulthera_800", "liftera_800", "price");
    if (has("ulthera_600")) replace("ulthera_600", "liftera_600", "price");
    if (has("ulthera_400")) replace("ulthera_400", "liftera_400", "price");
    if (has("thermage_900")) replace("thermage_900", "sof_wave_300", "price");
    if (has("thermage_600")) replace("thermage_600", "sof_wave_200", "price");
    ["co2", "fraxel"].forEach(t => { if (has(t as TreatmentKey)) replace(t as TreatmentKey, "genesis", "price"); });
  }

  if (priority === "pain") {
    ["ulthera_800", "ulthera_600", "ulthera_400", "ulthera_200"].forEach(t => {
      if (has(t as TreatmentKey)) replace(t as TreatmentKey, "sof_wave_300", "pain");
    });
    ["co2", "fraxel", "secret", "potenza"].forEach(t => {
      if (has(t as TreatmentKey)) replace(t as TreatmentKey, "genesis", "pain");
    });
  }

  if (priority === "recoveryTime" || priority === "minimal_downtime") {
    ["co2", "fraxel"].forEach(t => {
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
