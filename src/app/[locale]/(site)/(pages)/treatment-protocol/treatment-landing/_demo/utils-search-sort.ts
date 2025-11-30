import type { Treatment } from "@/constants/treatment/types";
import type { SortKey, SortOrder } from "./SearchSortBar";

export const matchScore = (t: Treatment, q: string, locale: "ko" | "en"): number => {
  if (!q) return 1;
  const hay = [
    t.name[locale], t.summary[locale],
    ...t.tags.map(tag => tag[locale])
  ].join(" ").toLowerCase();
  const needle = q.toLowerCase().trim();
  if (!needle) return 1;
  let score = 0;
  needle.split(/\s+/).forEach(tok => {
    if (hay.includes(tok)) score += 1;
  });
  return score || 0;
};

const getSortValue = (t: Treatment, key: SortKey): number => {
  switch (key) {
    case "price": return t.attributes.cost.from;
    case "pain": return t.attributes.pain.pain_score_0_10;
    case "duration": return (t.attributes.effect.duration_months_min + t.attributes.effect.duration_months_max) / 2;
    default: return 0;
  }
};

export const sortTreatments = (
  arr: Treatment[],
  key: SortKey,
  order: SortOrder,
  query: string,
  locale: "ko" | "en"
) => {
  const mult = order === "asc" ? 1 : -1;
  return [...arr].sort((a, b) => {
    if (key === "relevance") {
      const sa = matchScore(a, query, locale);
      const sb = matchScore(b, query, locale);
      return (sb - sa) || (a.name[locale].localeCompare(b.name[locale]));
    }
    const va = getSortValue(a, key);
    const vb = getSortValue(b, key);
    if (va === vb) return a.name[locale].localeCompare(b.name[locale]);
    return (va - vb) * mult;
  });
};
