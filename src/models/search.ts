export type SearchResultType = 'treatment' | 'hospital' | 'product' | 'treatment_group'

// Hospital within a treatment group
export interface TreatmentGroupHospital {
  id: string
  name: string
  name_ko: string
  thumbnail_url: string | null
  price: number
  product_name: string
  product_name_ko: string
}

// Treatment group suggestion (shows hospitals offering a treatment)
export interface TreatmentGroupSuggestion {
  type: 'treatment_group'
  treatment_id: string
  treatment_name: string
  treatment_name_ko: string
  hospitals: TreatmentGroupHospital[]
}

// Basic suggestion for hospital/product
export interface BasicSuggestion {
  type: 'hospital' | 'product'
  id: string
  label: string
  label_ko: string
  category: string
  thumbnail_url?: string | null
  id_uuid_hospital?: string
}

// Union type for all suggestions
export type SearchSuggestion = BasicSuggestion | TreatmentGroupSuggestion

export interface SuggestResponse {
  suggestions: SearchSuggestion[]
  query: string
  total: number
}

export interface TreatmentResult {
  id: string
  ko: string
  en: string
  group_id: string
  category: string
  summary: Record<string, unknown> | null
  tags: Record<string, unknown> | null
}

export interface HospitalResult {
  id_uuid: string
  name: string
  name_en: string
  address_gu_en: string
  thumbnail_url: string | null
  favorite_count: number
}

export interface ProductResult {
  id: number
  id_uuid_hospital: string
  name: { en: string; ko: string }
  level1: { en: string; ko: string }
  department: { en: string; ko: string }
  price: number
  group_id: string
  matched_root_ids: string[]
  match_score: number
  hospital_name: string
  hospital_location: string
}

export interface SearchResults {
  treatments: TreatmentResult[]
  hospitals: HospitalResult[]
  treatment_products: ProductResult[]
  total: number
}

export interface PopularTerm {
  term: string
  count: number
}

export interface PopularResponse {
  terms: PopularTerm[]
}
