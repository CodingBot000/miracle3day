import { Candidate, PriorityId, Substitution, ExcludedItem, TreatmentKey } from '../types';
import { PRICE_TABLE } from '../constants/prices';
import { META, LIFTING_ORDER, TEXTURE_STRONG, TEXTURE_GENTLE } from '../constants/treatmentMeta';

/**
 * 예산 적용
 * 기존 enforceBudget 함수를 그대로 이동
 */
export function enforceBudget(
  cands: Candidate[],
  budgetUpper: number,
  substitutions: Substitution[],
  excluded: ExcludedItem[],
  priority: PriorityId,
): Candidate[] {
  const sumKRW = (xs: Candidate[]) => xs.reduce((acc, x) => acc + PRICE_TABLE[x.key], 0);
  let arr = [...cands];
  let total = sumKRW(arr);

  if (total <= budgetUpper) return arr;

  // 1) 중요도 3부터 제거(비싼 것 우선)
  const removable = [...arr].sort((a, b) => (b.importance - a.importance) || (PRICE_TABLE[b.key] - PRICE_TABLE[a.key]));
  for (const c of removable) {
    if (total <= budgetUpper) break;
    if (c.importance > 1) {
      arr = arr.filter(x => x.key !== c.key);
      excluded.push({ key: c.key, label: META[c.key].label, reason: `Budget limit exceeded: removed (priority ${c.importance})` });
      total = sumKRW(arr);
    }
  }
  if (total <= budgetUpper) return arr;

  // 2) 리프팅 계열 단계적 다운스케일 치환
  const present = (keys: TreatmentKey[]) => keys.find((k) => arr.some((c) => c.key === k));
  const tryScaleDown = (order: TreatmentKey[]) => {
    let changed = false;
    for (let i = 0; i < order.length; i++) {
      const k = order[i];
      const idx = arr.findIndex(c => c.key === k);
      if (idx >= 0) {
        for (let j = i + 1; j < order.length; j++) {
          const alt = order[j];
          if (!arr.find(c => c.key === alt)) {
            const before = arr[idx];
            arr[idx] = { ...before, key: alt };
            substitutions.push({ from: k, to: alt, reason: "price" });
            changed = true;
            total = sumKRW(arr);
            if (total <= budgetUpper) return true;
            break;
          }
        }
      }
    }
    return changed;
  };
  if (present(LIFTING_ORDER)) {
    while (total > budgetUpper && tryScaleDown(LIFTING_ORDER)) { /* 반복 치환 */ }
  }

  // 3) 텍스처 강 → 경 치환
  TEXTURE_STRONG.forEach(t => {
    const idx = arr.findIndex(c => c.key === t);
    if (idx >= 0 && total > budgetUpper) {
      const before = arr[idx];
      const alt = TEXTURE_GENTLE.find(g => !arr.find(c => c.key === g)) || "genesis";
      arr[idx] = { ...before, key: alt as TreatmentKey, why: `${before.why} → budget-friendly (gentler option)` };
      substitutions.push({ from: t, to: alt as TreatmentKey, reason: "price" });
      total = sumKRW(arr);
    }
  });

  // 4) 여전히 초과면, 중요도 2까지 비용 큰 순서로 제거
  if (total > budgetUpper) {
    const byCostDesc = [...arr].sort((a, b) => PRICE_TABLE[b.key] - PRICE_TABLE[a.key]);
    for (const c of byCostDesc) {
      if (total <= budgetUpper) break;
      if (c.importance >= 2) {
        arr = arr.filter(x => x.key !== c.key);
        excluded.push({ key: c.key, label: META[c.key].label, reason: "Budget limit exceeded: removed (high cost)" });
        total = sumKRW(arr);
      }
    }
  }

  // 5) 핵심(importance=1)까지 포함 불가 시: 핵심 일부 제거 + 더 저렴한 핵심 대체 시도
  if (total > budgetUpper) {
    // 핵심 중 리프팅 계열이 있으면 LIFTING_ORDER 하향 시도
    const coreLifts = arr.filter(x => x.importance === 1 && LIFTING_ORDER.includes(x.key));
    if (coreLifts.length) {
      while (total > budgetUpper && tryScaleDown(LIFTING_ORDER)) {
        total = sumKRW(arr);
      }
    }
    // 그래도 초과면 핵심 중 비용 큰 것부터 제거(최소 1개는 유지)
    if (total > budgetUpper) {
      const essentials = arr.filter(x => x.importance === 1);
      if (essentials.length > 1) {
        const byCostDesc = essentials.sort((a, b) => PRICE_TABLE[b.key] - PRICE_TABLE[a.key]);
        for (let i = 0; i < byCostDesc.length - 1 && total > budgetUpper; i++) {
          const c = byCostDesc[i];
          arr = arr.filter(x => x.key !== c.key);
          excluded.push({ key: c.key, label: META[c.key].label, reason: "Budget limit exceeded: reduced core set" });
          total = sumKRW(arr);
        }
      }
    }
  }

  // 6) 최종 안전장치: 아무 것도 남지 않을 경우, 가장 저렴한 후보 1개라도 남김
  if (arr.length === 0) {
    const cheapest: TreatmentKey = (Object.keys(PRICE_TABLE) as TreatmentKey[])
      .sort((a, b) => PRICE_TABLE[a] - PRICE_TABLE[b])[0];
    arr.push({ key: cheapest, importance: 1, why: "Cheapest fallback due to strict budget" });
  }

  return arr;
}
