import { ExcludedItem, Substitution, PriorityId } from '@/app/(site)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/types';
import { META } from '@/app/(site)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/questionScript/matching/constants/treatmentMeta';

/**
 * 업셀/대안 제안 (영문)
 * 기존 buildUpgradeSuggestions 함수를 그대로 이동
 */
export function buildUpgradeSuggestions(
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
      msgs.push(`If pain is a concern, strong local anesthesia or sedation can broaden options (e.g., ${painRelated.slice(0, 3).map(e => META[e.key].label).join(", ")}).`);
    }
  }

  if (priority === "recoveryTime" || priority === "minimal_downtime") {
    const dtRelated = excluded.filter(e => /downtime|다운타임/i.test(e.reason));
    if (dtRelated.length) {
      msgs.push(`If some downtime is tolerable, 1–2 sessions of high-intensity treatments (e.g., ${dtRelated.slice(0, 3).map(e => META[e.key].label).join(", ")}) can accelerate results.`);
    }
  }

  const budgetDrops = excluded.filter(e => /Budget limit exceeded/i.test(e.reason));
  if (budgetDrops.length && Number.isFinite(budgetUpper)) {
    msgs.push(`By slightly increasing your budget, you can include excluded treatments (e.g., ${budgetDrops.slice(0, 3).map(e => META[e.key].label).join(", ")}) to maximize outcomes.`);
  }

  // 중복 메시지 제거: 동일한 내용의 메시지를 필터링
  const uniqueMsgs = Array.from(new Set(msgs));

  return uniqueMsgs;
}
