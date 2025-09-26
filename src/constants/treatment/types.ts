// types.ts
// Shared type definitions for the treatment catalog (ko/en bilingual).

export type LocaleString = {
  ko: string;
  en: string;
};

export type Tag = LocaleString;

export type Area = {
  key: string;      // snake_case identifier
  ko: string;
  en: string;
};

export type Effect = {
  onset_label: LocaleString;    // e.g., "즉시", "2–4주", etc.
  onset_weeks_min: number;      // can be 0 for "immediate"
  onset_weeks_max: number;      // can equal min
  duration_months_min: number;  // expected lower bound
  duration_months_max: number;  // expected upper bound
  ko?: string;                  // optional description (ko)
  en?: string;                  // optional description (en)
};

export type Downtime = LocaleString;

export type PainLevel =
  | 'none'
  | 'low'
  | 'none_low'       // used for very mild procedures
  | 'low_medium'
  | 'medium'
  | 'medium_high'
  | 'high';

export type Pain = {
  level: PainLevel;
  pain_score_0_10: number; // integer 0–10
};

export type Cost = {
  currency: string;   // e.g., 'KRW'
  from: number;       // minimal expected price
  note_ko?: string;
  note_en?: string;
};

export type Recommended = {
  sessions_min: number;
  sessions_max: number;
  interval_weeks: number; // 0 if one-off
  maintenance_note: LocaleString;
};

export type Attributes = {
  effect: Effect;
  downtime: Downtime;
  pain: Pain;
  cost: Cost;
  recommended: Recommended;
};

export type Treatment = {
  id: string;
  name: LocaleString;
  summary: LocaleString;
  tags: Tag[];
  attributes: Attributes;
};

export type Category = {
  category_key: string;
  ko: string;
  en: string;
  concern_copy: LocaleString;
  areas: Area[];
  treatments: Treatment[];
};

// Known category keys as a union for stronger typing (extend as you add more files)
export type CategoryKey =
  | 'Lifting_Firming'
  | 'Body_Contouring'
  | 'Wrinkle_AntiAging'
  | 'Tone_Texture'
  | 'Acne_Scars'
  | 'Pores_Sebum'
  | 'Pigmentation_Spots'
  | 'Hair_Removal'
  | 'Skin_Care'
  | 'Filler_Volume'
  | 'Hair_Scalp';

// ---------- UI-friendly helpers ----------

export const painScoreToIcon = (score: number): string => {
  if (score <= 1) return '😌';
  if (score <= 3) return '🙂';
  if (score <= 5) return '😐';
  if (score <= 7) return '😖';
  return '😫';
};

export const downtimeToChip = (dt: Downtime, locale: 'ko' | 'en' = 'ko') =>
  (dt?.[locale] ?? '').replace(/\s+/g, ' ').trim();

export const formatCurrencyKRW = (amount: number) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount);

// Build a compact "info line" for cards
export const buildInfoLine = (t: Treatment, locale: 'ko' | 'en' = 'ko') => {
  const { effect, downtime, pain, cost } = t.attributes;
  const onset = effect.onset_label?.[locale] ?? '';
  const duration = `${effect.duration_months_min}–${effect.duration_months_max}m`;
  const dt = downtimeToChip(downtime, locale);
  const painIcon = painScoreToIcon(pain.pain_score_0_10);
  const price = formatCurrencyKRW(cost.from);
  return `✨ ${onset}/${duration} · 🤕 ${dt} · ${painIcon} ${pain.pain_score_0_10}/10 · 💰 ${price}+`;
};