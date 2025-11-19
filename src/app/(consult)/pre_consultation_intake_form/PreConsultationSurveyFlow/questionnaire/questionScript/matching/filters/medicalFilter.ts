import { Candidate, MedicalId, ExcludedItem } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/types';
import { isInjectable, createsWound } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/utils/helpers';
import { META } from '@/app/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/constants/treatmentMeta';

/**
 * 의학적 상태 필터 (효과 우선이지만 금기 시술은 제외)
 * 기존 applyMedicalFilters 함수를 그대로 이동
 */
export function applyMedicalFilters(
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

  if (medical.includes("keloid_tendency")) {
    notes.push("Keloid tendency: avoid wound-causing treatments or use with caution.");
  }

  return out;
}
