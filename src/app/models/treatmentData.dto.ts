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
    days_min?: number;
    days_max?: number;
    level?: string;
  };
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
  benefits_ko: string;
  benefits_en: string;
  sequence_ko: string;
  sequence_en: string;
  cautions_ko: string;
  cautions_en: string;
  
  // Extension field
  meta?: Record<string, any>;
  
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
  benefits_ko: string;
  benefits_en: string;
  sequence_ko: string;
  sequence_en: string;
  cautions_ko: string;
  cautions_en: string;
  meta?: Record<string, any>;
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