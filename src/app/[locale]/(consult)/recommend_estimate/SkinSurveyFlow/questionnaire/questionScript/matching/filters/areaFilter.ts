import { log } from '@/utils/logger';
import { Candidate, AreaId, ExcludedItem } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/types';
import { inAreas } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/utils/helpers';
import { META } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching/constants/treatmentMeta';

/**
 * 부위 필터
 * 선택된 부위에 적용 가능한 시술만 남김
 */
export function filterByArea(
  cands: Candidate[],
  areas: AreaId[],
  excluded: ExcludedItem[]
): Candidate[] {
  const out: Candidate[] = [];

  log.debug(`[AREA FILTER] Selected areas:`, areas);

  for (const c of cands) {
    const treatmentAreas = META[c.key].areas;
    const isMatch = inAreas(c.key, areas);

    log.debug(`[AREA FILTER] ${c.key}:`, {
      treatmentAreas,
      selectedAreas: areas,
      match: isMatch
    });

    if (isMatch) {
      out.push(c);
    } else {
      excluded.push({
        key: c.key,
        label: META[c.key].label,
        reason: "Not relevant to selected area"
      });
    }
  }

  return out;
}
