import { z } from "zod";

export interface TreatmentData {
  id_uuid_treatment: string;
  option_value: string;
  price: number;
  discount_price: number;
  price_expose: number;
  etc?: string;
}

// TypeScript interfaces for treatment database tables

export interface TreatmentSimilarGroup {
  group_id: string;
  ko: string;
  en: string;
  sort_order?: number;
  icon?: string;
  color?: string;
  slug?: string;
  is_active?: boolean;
  description?: Record<string, any>;
}

export interface TreatmentAttributes {
  pain?: {
    level?: string;
    pain_score_0_10?: number;
  };
  effect?: {
    onset_label?: {
      ko?: string;
      en?: string;
    };
    onset_weeks_min?: number;
    onset_weeks_max?: number;
    duration_months_min?: number;
    duration_months_max?: number;
  };
  cost?: {
    currency?: string;
    from?: number;
  };
  recommended?: {
    sessions_min?: number;
    sessions_max?: number;
    interval_weeks?: number;
    maintenance_note?: {
      ko?: string;
      en?: string;
    };
  };
  downtime?: {
    ko?: string;
    en?: string;
  };
}

// sequence step types
export type SequenceStepType =
  | 'step'
  | 'treatment'
  | 'booster'
  | 'filler'
  | 'maintenance'
  | 'check'
  | 'note';

export interface LocalizedText {
  ko?: string | null;
  en?: string | null;
  // 확장 여지: ja/zh 등 추가 가능
  [lang: string]: string | null | undefined;
}

export interface SequenceTitle extends LocalizedText {
  // 여유 확장: 필요 시 ja/zh 등도 추가 가능
}

export interface SequenceTiming {
  /** 시작 기준으로부터의 상대 오프셋(일). 없으면 null */
  offsetDays?: number | null;
  /** 다음 단계까지 최소/최대 대기(일) */
  waitMinDays?: number | null;
  waitMaxDays?: number | null;
  /** 텍스트 파싱 시 생기는 범위 표현(예: "1–2") */
  afterWeeks?: string | null;
}

export interface RepeatRule {
  intervalDaysMin?: number | null;
  intervalDaysMax?: number | null;
  count?: number | null;      // 반복 횟수(미정이면 null)
  until?: string | null;      // 관찰 조건 등 자유 텍스트
  energy?: 'low' | 'medium' | 'high' | string | null;
}

export interface SequenceStep {
  order: number;                  // 1부터 시작하는 표시 순서
  type: SequenceStepType;         // step/treatment/booster/filler/note...
  title: SequenceTitle;           // ko/en 병기
  timing?: SequenceTiming | null; // 없으면 null
  note?: string | null;           // 보조 설명
  repeat?: RepeatRule | null;     // 반복 규칙
}

export type LocalizedTitle = LocalizedText;

export interface BenefitInput {
  title: LocalizedTitle;
  meta?: Record<string, any>;
}

export interface BenefitResult {
  title: LocalizedTitle;
  meta?: Record<string, any>;
}

export interface Benefits {
  inputs: BenefitInput[];
  result: BenefitResult;
}

export interface TreatmentRoot {
  id: string;
  ko: string;
  en: string;
  group_id: string;
  summary: Record<string, string>;
  tags: string[];
  attributes: TreatmentAttributes;
  
  // Generated columns
  pain_level?: string;
  pain_score_0_10?: number;
  effect_onset_weeks_min?: number;
  effect_onset_weeks_max?: number;
  duration_months_min?: number;
  duration_months_max?: number;
  cost_currency?: string;
  cost_from?: number;
  rec_sessions_min?: number;
  rec_sessions_max?: number;
  rec_interval_weeks?: number;
}

export interface TreatmentAlias {
  alias_id: string;
  root_id: string;
  ko: string;
  en: string;
  created_at?: string;
  updated_at?: string;
}

export interface TreatmentCareProtocol {
  id: string;
  
  // Topic (major category)
  topic_id: string;
  topic_title_ko: string;
  topic_title_en: string;
  topic_sort_order?: number;
  
  // Topic copy (optional)
  concern_copy_ko?: string;
  concern_copy_en?: string;
  
  // Area (section)
  area_id: string;
  area_name_ko: string;
  area_name_en: string;
  area_sort_order?: number;
  
  // Treatment arrays
  primary_treatment_ids: string[];
  alt_treatment_ids: string[];
  combo_treatment_ids: string[];
  
  // Text descriptions (multilingual)
  benefits: Benefits;
  sequence: SequenceStep[];
  cautions: LocalizedText;

  // Extension field
  meta?: Record<string, any>;

  // (선택) DB의 generated 컬럼을 반영했다면
  step_count?: number;

  created_at?: string;
  updated_at?: string;
}

// Response DTOs for API
export interface TreatmentCareProtocolWithTreatments extends TreatmentCareProtocol {
  primary_treatments?: TreatmentRoot[];
  alt_treatments?: TreatmentRoot[];
  combo_treatments?: TreatmentRoot[];
}

export interface TreatmentCategoryResponse {
  topic_id: string;
  topic_title_ko: string;
  topic_title_en: string;
  topic_sort_order: number;
  concern_copy_ko?: string;
  concern_copy_en?: string;
  areas: TreatmentAreaResponse[];
}

export interface TreatmentAreaResponse {
  area_id: string;
  area_name_ko: string;
  area_name_en: string;
  area_sort_order: number;
  primary_treatments: TreatmentRoot[];
  alt_treatments: TreatmentRoot[];
  combo_treatments: TreatmentRoot[];
  benefits: Benefits;
  sequence: SequenceStep[];
  cautions: LocalizedText;
  meta?: Record<string, any>;
  step_count?: number;
}

// API request/response types
export interface GetTreatmentCareProtocolsParams {
  topic_id?: string;
  area_id?: string;
  limit?: number;
  offset?: number;
}

export interface GetTreatmentCareProtocolsResponse {
  data: TreatmentCategoryResponse[];
  total: number;
  has_more: boolean;
}

// 첫 화면용: 토픽 리스트 응답
export interface TopicListResponse {
  data: TopicWithAreas[];
}

export interface TopicWithAreas {
  topic_id: string;
  topic_title_ko: string;
  topic_title_en: string;
  topic_sort_order: number;
  concern_copy_ko?: string;
  concern_copy_en?: string;
  areas: AreaBasicInfo[];
}

export interface AreaBasicInfo {
  area_id: string;
  area_name_ko: string;
  area_name_en: string;
  area_sort_order: number;
}

// 상세 화면용: 토픽 상세 응답
export interface TopicDetailResponse {
  areas: AreaBasicInfo[];
  content: AreaDetailContent;
}

export interface AreaDetailContent extends TreatmentCareProtocol {
  primary_treatments: TreatmentRoot[];
  alt_treatments: TreatmentRoot[];
  combo_treatments: TreatmentRoot[];
}

// Locale type
export type Locale = 'ko' | 'en';

// For compatibility with existing types
export interface LegacyTreatment {
  id: string;
  name: Record<Locale, string>;
  summary: Record<Locale, string>;
  tags: Array<Record<Locale, string>>;
  attributes: TreatmentAttributes;
}

export interface LegacyCategory {
  category_key: string;
  category_name: Record<Locale, string>;
  treatments: LegacyTreatment[];
}

export const LocalizedTextSchema = z
  .object({
    ko: z.string().nullable().optional(),
    en: z.string().nullable().optional(),
  })
  .catchall(z.string().nullable().optional());

export const SequenceTitleSchema = LocalizedTextSchema;
export const LocalizedTitleSchema = LocalizedTextSchema;

export const SequenceTimingSchema = z.object({
  offsetDays: z.number().int().nullable().optional(),
  waitMinDays: z.number().int().nullable().optional(),
  waitMaxDays: z.number().int().nullable().optional(),
  afterWeeks: z.string().nullable().optional(),
});

export const RepeatRuleSchema = z.object({
  intervalDaysMin: z.number().int().nullable().optional(),
  intervalDaysMax: z.number().int().nullable().optional(),
  count: z.number().int().nullable().optional(),
  until: z.string().nullable().optional(),
  energy: z.string().nullable().optional(),
});

export const SequenceStepSchema = z.object({
  order: z.number().int().min(1),
  type: z.enum(['step','treatment','booster','filler','maintenance','check','note']),
  title: SequenceTitleSchema,
  timing: SequenceTimingSchema.nullable().optional(),
  note: z.string().nullable().optional(),
  repeat: RepeatRuleSchema.nullable().optional(),
});

export const BenefitInputSchema = z.object({
  title: LocalizedTitleSchema,
  meta: z.record(z.any()).optional(),
});

export const BenefitResultSchema = z.object({
  title: LocalizedTitleSchema,
  meta: z.record(z.any()).optional(),
});

export const BenefitsSchema = z.object({
  inputs: z.array(BenefitInputSchema),
  result: BenefitResultSchema,
});

export const TreatmentCareProtocolSchema = z
  .object({
    id: z.string(),
    topic_id: z.string(),
    topic_title_ko: z.string(),
    topic_title_en: z.string(),
    topic_sort_order: z.number().int().optional(),
    concern_copy_ko: z.string().optional(),
    concern_copy_en: z.string().optional(),
    area_id: z.string(),
    area_name_ko: z.string(),
    area_name_en: z.string(),
    area_sort_order: z.number().int().optional(),
    primary_treatment_ids: z.array(z.string()),
    alt_treatment_ids: z.array(z.string()),
    combo_treatment_ids: z.array(z.string()),
    benefits: BenefitsSchema,
    sequence: z.array(SequenceStepSchema),
    cautions: LocalizedTextSchema,
    meta: z.record(z.any()).optional(),
    step_count: z.number().int().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();
