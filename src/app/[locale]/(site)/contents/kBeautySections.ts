export const kBeautySectionIds = [
  'overview',
  'skincare',
  'dermatology',
  'plastic-surgery',
  'science',
  'culture',
  'lifestyle',
] as const;

export type KBeautySectionId = (typeof kBeautySectionIds)[number];

export const kBeautySectionRoutes: Record<KBeautySectionId, string> = {
  'overview': 'why-k-beauty-is-best',
  'skincare': 'k-skincare-secret',
  'dermatology': 'dermatology-treatments',
  'plastic-surgery': 'plastic-surgery-philosophy',
  'science': 'science-and-rd',
  'culture': 'k-culture-impact',
  'lifestyle': 'beauty-lifestyle',
};

export function findSectionBySlug(slug: string): KBeautySectionId | null {
  const entry = Object.entries(kBeautySectionRoutes).find(
    ([_, route]) => route === slug
  );
  return entry ? (entry[0] as KBeautySectionId) : null;
}
