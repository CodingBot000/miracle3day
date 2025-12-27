/**
 * 스킨케어 온보딩 데이터 전송 객체 (DTO)
 *
 * 데이터베이스 스키마와 1:1 매칭
 */

export interface SkincareOnboardingDTO {
  id_uuid: string;                  // 사용자 UUID
  age_group?: string;               // '10s', '20s', '30s', '40s', '50s+'
  gender?: string;                  // 'female', 'male', 'prefer_not_to_say'
  country_code?: string;            // 'US', 'CN', 'zh-CN', 'zh-TW'
  region?: string;                  // 'Northeast', 'West', NULL
  city?: string;                    // 'New York', NULL
  skin_type?: string;               // 'dry', 'oily', 'combination', 'sensitive'
  skin_concerns?: string[];         // ['fine_lines', 'dryness', ...]
  current_products?: string[];      // ['cleanser', 'moisturizer', ...]
  daily_routine_time?: string;      // 'under_5min', '5_10min', 'over_10min'
  primary_goal?: string;            // 'hydration', 'anti_aging', ...
  interested_ingredients?: string[]; // ['hyaluronic_acid', ...]
  product_preferences?: string[];   // ['natural', 'fragrance_free', ...]
  sleep_pattern?: string;           // 'regular', 'normal', 'night_owl', 'irregular'
  work_environment?: string;        // 'indoor', 'outdoor', 'mixed'
  exercise_frequency?: string;      // 'rarely', 'weekly_1_2', ...
  monthly_budget?: string;          // 'under_30', '30_100', ...
  onboarding_completed?: boolean;   // 완료 여부
  onboarding_step?: number;         // 마지막 단계
}

/**
 * API 응답 타입
 */
export interface OnboardingApiResponse {
  success: boolean;
  message: string;
  data?: SkincareOnboardingDTO;
}

/**
 * 질문 선택지 타입
 */
export interface QuestionOption {
  value: string;
  label: string;
  icon?: string;
}

/**
 * 질문 데이터 구조
 */
export interface QuestionData {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'single_choice_with_search';
  title: string;
  subtitle?: string;
  options: QuestionOption[];
  skip_allowed?: boolean;
  max_selections?: number;
}
