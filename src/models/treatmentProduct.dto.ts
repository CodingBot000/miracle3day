/**
 * Treatment Product DTO
 * Represents treatment/procedure products offered by hospitals
 */

export interface TreatmentProductJsonb {
  ko?: string;
  en?: string;
}

/**
 * Meta 데이터의 가격 관련 정보
 */
export interface MetaPricing {
  original_price?: number;      // 원가
  discount_rate?: number;        // 할인율 (%)
  min_price?: number;            // 최소 가격
  max_price?: number;            // 최대 가격
  pricing?: {                    // 중첩된 pricing 객체
    min_price?: number;
    max_price?: number;
  };
}

/**
 * Meta 데이터의 기타 시술 정보
 */
export interface MetaTreatmentDetails {
  // 케이스1: 시술 용량/수량
  volume?: string;              // 예: "3cc"
  quantity?: string;            // 예: "1 line"
  dosage?: string;              // 예: "5mg"
  shots?: number;               // 예: 300

  // 케이스2: 시술 방식/장비
  method?: string;              // 예: "MTS"
  mode?: string;                // 예: "FX"
  device?: string;              // 예: "apogee-plus"
  injection_type?: string;      // 예: "intravenous"

  // 케이스3: 패키지/업그레이드 옵션
  package_type?: string;        // 예: "abdomen_complete"
  upgrade?: string;             // 예: "4cc + LDM 12분"
  time_upgrade?: string;        // 예: "LDM 12분"
  volume_upgrade?: string;      // 예: "4cc"
  stages?: number;              // 단계 수
  stage?: number;               // 현재 단계

  // 케이스4: 시술 대상/제한
  gender?: string;              // 예: "female"
  area?: string[] | string;     // 예: ["주름"] 또는 "주름"
  size_limit?: string;          // 예: "2mm 이하"
  quantity_limit?: string;      // 예: "10개까지"
  sedation?: boolean;           // 수면 마취 여부

  // 케이스5: 설명/분류
  category?: string;            // 예: "whitening"
  common_name?: string;         // 예: "백옥주사"
  desc?: string;                // 설명
  introduction?: {              // 다국어 소개
    ko?: string;
    en?: string;
    ja?: string;
    'zh-CN'?: string;
    'zh-TW'?: string;
  };
  note?: string;                // 주의사항
  includes?: string[] | string; // 포함 항목들 (배열 또는 문자열)

  // 케이스6: 프로모션
  promotion?: string;           // 예: "limited_price"
  duration?: string;            // 예: "1 year unlimited"
}

export interface TreatmentProductData {
  id: number;
  id_uuid_hospital: string;
  department: string;
  level1: TreatmentProductJsonb;
  name: TreatmentProductJsonb;
  option_value: string;
  unit: TreatmentProductJsonb;
  price: number;
  group_id: string;
  expose: boolean;

  // Meta 데이터 추가
  meta?: MetaPricing & MetaTreatmentDetails;
}

/**
 * Grouped treatment products by department and group
 */
export interface GroupedTreatmentProducts {
  department: string;
  groups: TreatmentGroup[];
}

export interface TreatmentGroup {
  groupTitle: TreatmentProductJsonb; // name field used as group title
  items: TreatmentProductData[];
}
