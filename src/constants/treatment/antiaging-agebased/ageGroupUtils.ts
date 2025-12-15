export const AGE_GROUP_SLUGS = {
  '20s': '20s',
  '30s': '30s',
  '40s': '40s',
  '50s': '50s',
  '60s': '60s',
  '70s+': '70s-plus'
} as const;

export const SLUG_TO_AGE_GROUP = {
  '20s': '20s',
  '30s': '30s',
  '40s': '40s',
  '50s': '50s',
  '60s': '60s',
  '70s-plus': '70s+'
} as const;

export type AgeGroupSlug = keyof typeof SLUG_TO_AGE_GROUP;
export type AgeGroup = '20s' | '30s' | '40s' | '50s' | '60s' | '70s+';

export const ageGroups: AgeGroup[] = ['20s', '30s', '40s', '50s', '60s', '70s+'];

export function isValidAgeGroup(slug: string): slug is AgeGroupSlug {
  return slug in SLUG_TO_AGE_GROUP;
}

export function getAgeGroupFromSlug(slug: string): AgeGroup | null {
  return isValidAgeGroup(slug) ? SLUG_TO_AGE_GROUP[slug] : null;
}

export function getSlugFromAgeGroup(ageGroup: AgeGroup): AgeGroupSlug {
  return AGE_GROUP_SLUGS[ageGroup];
}
