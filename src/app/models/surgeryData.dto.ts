import { z } from "zod";

// 성형외과 수술 프로토콜 타입 정의

export interface LocalizedContent {
  ko: string;
  en: string;
}

export interface SurgeryPreparation {
  tagline?: LocalizedContent;
  description?: LocalizedContent;
  pre_consultation?: LocalizedContent;
  pre_medication?: LocalizedContent;
  avoid_before?: LocalizedContent;
  fasting?: LocalizedContent;
  [key: string]: any; // 추가 필드를 위한 유연성
}

export interface RecoveryTimelineStep {
  ko: string;
  en: string;
}

export interface RecoveryTimeline {
  immediate?: RecoveryTimelineStep;
  day_1_3?: RecoveryTimelineStep;
  day_3_4?: RecoveryTimelineStep;
  pod_1_3?: RecoveryTimelineStep;
  pod_7?: RecoveryTimelineStep;
  pod_14?: RecoveryTimelineStep;
  week_1?: RecoveryTimelineStep;
  week_2?: RecoveryTimelineStep;
  week_1_2?: RecoveryTimelineStep;
  week_2_4?: RecoveryTimelineStep;
  month_1?: RecoveryTimelineStep;
  month_2_3?: RecoveryTimelineStep;
  month_3_6?: RecoveryTimelineStep;
  month_6_plus?: RecoveryTimelineStep;
  [key: string]: RecoveryTimelineStep | undefined;
}

export interface ExpectedResults {
  duration: LocalizedContent;
  benefits: Array<{
    ko: string;
    en?: string;
  }>;
  visibility?: LocalizedContent;
  final_result?: LocalizedContent;
}

export interface SurgeryProtocol {
  id: string;
  category: 'facial_surgery' | 'body_surgery';
  category_title_ko: string;
  category_title_en: string;
  category_sort_order?: number;
  concern_copy_ko?: string;
  concern_copy_en?: string;
  area_id: string;
  area_name_ko: string;
  area_name_en: string;
  area_sort_order?: number;
  surgery_id: string;
  preparation: SurgeryPreparation;
  recovery_timeline: RecoveryTimeline;
  expected_results: ExpectedResults;
  cautions: LocalizedContent;
  meta?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface SurgeryListItem {
  id: string;
  area_id: string;
  area_name_ko: string;
  area_name_en: string;
  surgery_id: string;
  preparation: SurgeryPreparation;
  expected_results: ExpectedResults;
}

export interface SurgeryCategory {
  category: 'facial_surgery' | 'body_surgery';
  category_title_ko: string;
  category_title_en: string;
  category_sort_order: number;
  concern_copy_ko?: string;
  concern_copy_en?: string;
  surgeries: SurgeryListItem[];
}

export interface SurgeryProtocolsResponse {
  categories: SurgeryCategory[];
}

export interface SurgeryDetailResponse extends SurgeryProtocol {
  // 상세 페이지에서 필요한 추가 정보가 있다면 여기에
}

// Zod 스키마 정의 (검증용)

export const LocalizedContentSchema = z.object({
  ko: z.string(),
  en: z.string(),
});

export const SurgeryPreparationSchema = z.object({
  tagline: LocalizedContentSchema.optional(),
  description: LocalizedContentSchema.optional(),
  pre_consultation: LocalizedContentSchema.optional(),
  pre_medication: LocalizedContentSchema.optional(),
  avoid_before: LocalizedContentSchema.optional(),
  fasting: LocalizedContentSchema.optional(),
}).passthrough();

export const RecoveryTimelineStepSchema = z.object({
  ko: z.string(),
  en: z.string(),
});

export const RecoveryTimelineSchema = z.record(RecoveryTimelineStepSchema);

export const ExpectedResultsSchema = z.object({
  duration: LocalizedContentSchema,
  benefits: z.array(z.object({
    ko: z.string(),
    en: z.string().optional(),
  })),
  visibility: LocalizedContentSchema.optional(),
  final_result: LocalizedContentSchema.optional(),
});

export const SurgeryProtocolSchema = z.object({
  id: z.string(),
  category: z.enum(['facial_surgery', 'body_surgery']),
  category_title_ko: z.string(),
  category_title_en: z.string(),
  category_sort_order: z.number().int().optional(),
  concern_copy_ko: z.string().optional(),
  concern_copy_en: z.string().optional(),
  area_id: z.string(),
  area_name_ko: z.string(),
  area_name_en: z.string(),
  area_sort_order: z.number().int().optional(),
  surgery_id: z.string(),
  preparation: SurgeryPreparationSchema,
  recovery_timeline: RecoveryTimelineSchema,
  expected_results: ExpectedResultsSchema,
  cautions: LocalizedContentSchema,
  meta: z.record(z.any()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough();

// Locale type
export type Locale = 'ko' | 'en';

// Helper type for category keys
export type SurgeryCategoryKey = 'facial_surgery' | 'body_surgery';

// Timeline key format helper type
export type TimelineKey =
  | 'immediate'
  | 'day_1_3'
  | 'day_3_4'
  | 'pod_1_3'
  | 'pod_7'
  | 'pod_14'
  | 'week_1'
  | 'week_2'
  | 'week_1_2'
  | 'week_2_4'
  | 'month_1'
  | 'month_2_3'
  | 'month_3_6'
  | 'month_6_plus';
