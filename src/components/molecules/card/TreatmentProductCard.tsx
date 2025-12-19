"use client";

import { TreatmentProductData, MetaTreatmentDetails } from "@/models/treatmentProduct.dto";
import { useLocale } from "next-intl";
import { FALLBACK_RATES } from "@/utils/exchangeRate/types";

/**
 * Locale에 따른 환율 및 통화 정보
 */
const getCurrencyInfo = (locale: string) => {
  switch (locale) {
    case 'ko':
      return {
        rate: 1, // KRW는 기준
        symbol: '₩',
        localeStr: 'ko-KR'
      };
    case 'en':
      return {
        rate: FALLBACK_RATES['KRW_USD'] ?? 0.00072,
        symbol: '$',
        localeStr: 'en-US'
      };
    case 'ja':
      return {
        rate: FALLBACK_RATES['KRW_JPY'] ?? 0.11,
        symbol: '¥',
        localeStr: 'ja-JP'
      };
    case 'zh-CN':
      return {
        rate: FALLBACK_RATES['KRW_CNY'] ?? 0.0052,
        symbol: '¥',
        localeStr: 'zh-CN'
      };
    case 'zh-TW':
      return {
        rate: FALLBACK_RATES['KRW_TWD'] ?? 0.023,
        symbol: 'NT$',
        localeStr: 'zh-TW'
      };
    default:
      // 기본값은 USD
      return {
        rate: FALLBACK_RATES['KRW_USD'] ?? 0.00072,
        symbol: '$',
        localeStr: 'en-US'
      };
  }
};

interface TreatmentProductCardProps {
  product: TreatmentProductData;
}

/**
 * 다국어 레이블 상수 (ko, en, ja, zh-CN, zh-TW)
 */
type SupportedLocale = 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW';
type LocalizedText = Record<SupportedLocale, string>;

const TREATMENT_PRODUCT_LABELS: Record<string, LocalizedText> = {
  // 가격 관련
  from: {
    ko: '부터',
    en: 'from',
    ja: 'から',
    'zh-CN': '起',
    'zh-TW': '起'
  },

  // 케이스1: 시술 용량/수량
  volume: {
    ko: '용량',
    en: 'Volume',
    ja: 'ボリューム',
    'zh-CN': '容量',
    'zh-TW': '容量'
  },
  quantity: {
    ko: '수량',
    en: 'Quantity',
    ja: '数量',
    'zh-CN': '数量',
    'zh-TW': '數量'
  },
  dosage: {
    ko: '용량',
    en: 'Dosage',
    ja: '用量',
    'zh-CN': '剂量',
    'zh-TW': '劑量'
  },
  shots: {
    ko: '샷',
    en: 'Shots',
    ja: 'ショット',
    'zh-CN': '次数',
    'zh-TW': '次數'
  },
  shotsUnit: {
    ko: '회',
    en: 'times',
    ja: '回',
    'zh-CN': '次',
    'zh-TW': '次'
  },

  // 케이스2: 시술 방식/장비
  method: {
    ko: '방식',
    en: 'Method',
    ja: '方式',
    'zh-CN': '方式',
    'zh-TW': '方式'
  },
  mode: {
    ko: '모드',
    en: 'Mode',
    ja: 'モード',
    'zh-CN': '模式',
    'zh-TW': '模式'
  },
  device: {
    ko: '장비',
    en: 'Device',
    ja: '機器',
    'zh-CN': '设备',
    'zh-TW': '設備'
  },
  injectionType: {
    ko: '주사 방식',
    en: 'Injection Type',
    ja: '注射方式',
    'zh-CN': '注射方式',
    'zh-TW': '注射方式'
  },

  // 케이스3: 패키지/업그레이드
  package: {
    ko: '패키지',
    en: 'Package',
    ja: 'パッケージ',
    'zh-CN': '套餐',
    'zh-TW': '套餐'
  },
  upgrade: {
    ko: '업그레이드',
    en: 'Upgrade',
    ja: 'アップグレード',
    'zh-CN': '升级',
    'zh-TW': '升級'
  },
  timeUpgrade: {
    ko: '시간 업그레이드',
    en: 'Time Upgrade',
    ja: '時間アップグレード',
    'zh-CN': '时间升级',
    'zh-TW': '時間升級'
  },
  volumeUpgrade: {
    ko: '용량 업그레이드',
    en: 'Volume Upgrade',
    ja: 'ボリュームアップグレード',
    'zh-CN': '容量升级',
    'zh-TW': '容量升級'
  },
  stageProgram: {
    ko: '단계 프로그램',
    en: 'Stage Program',
    ja: 'ステージプログラム',
    'zh-CN': '阶段计划',
    'zh-TW': '階段計劃'
  },
  currentStage: {
    ko: '현재',
    en: 'Current',
    ja: '現在',
    'zh-CN': '当前',
    'zh-TW': '當前'
  },
  stage: {
    ko: '단계',
    en: 'Stage',
    ja: 'ステージ',
    'zh-CN': '阶段',
    'zh-TW': '階段'
  },

  // 케이스4: 시술 대상/제한
  femaleOnly: {
    ko: '여성 전용',
    en: 'Female only',
    ja: '女性専用',
    'zh-CN': '仅限女性',
    'zh-TW': '僅限女性'
  },
  maleOnly: {
    ko: '남성 전용',
    en: 'Male only',
    ja: '男性専用',
    'zh-CN': '仅限男性',
    'zh-TW': '僅限男性'
  },
  treatmentArea: {
    ko: '시술 부위',
    en: 'Area',
    ja: '施術部位',
    'zh-CN': '治疗部位',
    'zh-TW': '治療部位'
  },
  sizeLimit: {
    ko: '크기 제한',
    en: 'Size Limit',
    ja: 'サイズ制限',
    'zh-CN': '大小限制',
    'zh-TW': '大小限制'
  },
  quantityLimit: {
    ko: '수량 제한',
    en: 'Quantity Limit',
    ja: '数量制限',
    'zh-CN': '数量限制',
    'zh-TW': '數量限制'
  },
  sedation: {
    ko: '수면 마취',
    en: 'Sedation available',
    ja: '睡眠麻酔',
    'zh-CN': '全身麻醉',
    'zh-TW': '全身麻醉'
  },

  // 케이스5: 설명/분류
  category: {
    ko: '카테고리',
    en: 'Category',
    ja: 'カテゴリー',
    'zh-CN': '类别',
    'zh-TW': '類別'
  },
  commonName: {
    ko: '별명',
    en: 'Also known as',
    ja: '別名',
    'zh-CN': '别名',
    'zh-TW': '別名'
  },
  caution: {
    ko: '주의',
    en: 'Caution',
    ja: '注意',
    'zh-CN': '注意',
    'zh-TW': '注意'
  },
  includes: {
    ko: '포함 사항',
    en: 'Includes',
    ja: '含まれるもの',
    'zh-CN': '包含项目',
    'zh-TW': '包含項目'
  },

  // 케이스6: 프로모션
  promotion: {
    ko: '프로모션',
    en: 'Promotion',
    ja: 'プロモーション',
    'zh-CN': '促销',
    'zh-TW': '促銷'
  },
  duration: {
    ko: '기간',
    en: 'Duration',
    ja: '期間',
    'zh-CN': '期限',
    'zh-TW': '期限'
  }
};

/**
 * 로케일에 맞는 텍스트를 가져오는 헬퍼 함수
 */
function getLocalizedLabel(key: string, locale: string): string {
  const normalizedLocale = locale as SupportedLocale;
  const label = TREATMENT_PRODUCT_LABELS[key];

  if (!label) return key;

  // 지원하는 로케일인 경우 해당 텍스트 반환, 아니면 영어 반환
  return label[normalizedLocale] || label.en;
}

/**
 * 가격 정보를 분석하고 포맷팅하는 유틸 함수
 * @param product - 시술 상품 데이터
 * @param locale - 현재 로케일 ('ko' | 'en' 등)
 * @returns 포맷된 가격 정보 객체
 */
interface FormattedPriceInfo {
  type: 'discount' | 'range' | 'from' | 'none';
  displayPrice?: string;          // 메인 가격 표시
  originalPrice?: string;         // 원가 (할인 시)
  discountRate?: number;          // 할인율
  minPrice?: string;              // 최소 가격 (범위 시)
  maxPrice?: string;              // 최대 가격 (범위 시)
  currencySymbol: string;         // 통화 기호
}

function formatPriceInfo(
  product: TreatmentProductData,
  locale: string
): FormattedPriceInfo {
  const currencyInfo = getCurrencyInfo(locale);
  const { rate, symbol: currencySymbol, localeStr } = currencyInfo;

  // 가격 변환 헬퍼 (KRW를 locale에 맞는 통화로 변환)
  const convertPrice = (krw: number) => {
    return Math.round(krw * rate);
  };

  // 가격 포맷팅 헬퍼
  const formatNumber = (num: number) => {
    const converted = convertPrice(num);
    return converted.toLocaleString(localeStr);
  };

  // 조건1: discount_rate이 있는 경우 (할인가 표시)
  if (product.meta?.discount_rate && product.meta?.original_price) {
    return {
      type: 'discount',
      displayPrice: formatNumber(product.price),
      originalPrice: formatNumber(product.meta.original_price),
      discountRate: product.meta.discount_rate,
      currencySymbol
    };
  }

  // 조건2: min_price와 max_price가 있는 경우 (가격 범위 표시)
  // pricing 객체 내부의 값도 체크
  const minPrice = product.meta?.min_price ?? product.meta?.pricing?.min_price;
  const maxPrice = product.meta?.max_price ?? product.meta?.pricing?.max_price;

  if (minPrice && maxPrice) {
    // min_price와 max_price가 같으면 하나만 표시 (from 형식)
    if (minPrice === maxPrice) {
      return {
        type: 'from',
        displayPrice: formatNumber(minPrice),
        currencySymbol
      };
    }

    // min_price와 max_price가 다르면 범위 표시
    return {
      type: 'range',
      minPrice: formatNumber(minPrice),
      maxPrice: formatNumber(maxPrice),
      currencySymbol
    };
  }

  // 조건3: price 컬럼만 있고 0이 아닌 경우 (최소 가격 표시)
  if (product.price > 0) {
    return {
      type: 'from',
      displayPrice: formatNumber(product.price),
      currencySymbol
    };
  }

  // 가격 정보 없음
  return {
    type: 'none',
    displayPrice: '',
    currencySymbol
  };
}

/**
 * 가격 정보를 렌더링하는 컴포넌트
 * 할인가, 가격 범위, 최소 가격 등 다양한 형태로 표시
 */
const PriceDisplay = ({ priceInfo, locale: _locale }: {
  priceInfo: FormattedPriceInfo;
  locale: string;
}) => {
  // 가격 정보가 없는 경우
  if (priceInfo.type === 'none') {
    return null;
  }

  // 조건1: 할인가 표시
  if (priceInfo.type === 'discount') {
    return (
      <div className="text-right">
        {/* 할인율 표시 */}
        <p className="text-xs font-bold text-red-500 mb-0.5">
          {priceInfo.discountRate}% OFF
        </p>

        {/* 할인가 (현재 가격) */}
        <p className="text-sm font-bold text-gray-900">
          {priceInfo.currencySymbol} {priceInfo.displayPrice}
        </p>

        {/* 원가 (취소선) */}
        <p className="text-xs text-gray-400 line-through">
          {priceInfo.currencySymbol} {priceInfo.originalPrice}
        </p>
      </div>
    );
  }

  // 조건2: 가격 범위 표시
  if (priceInfo.type === 'range') {
    return (
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">
          {priceInfo.currencySymbol} {priceInfo.minPrice}
          {' ~ '}
          {priceInfo.currencySymbol} {priceInfo.maxPrice}
        </p>
      </div>
    );
  }

  // 조건3: 최소 가격 표시
  if (priceInfo.type === 'from') {
    return (
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">
          {priceInfo.currencySymbol} {priceInfo.displayPrice}
        </p>
      </div>
    );
  }

  return null;
};

/**
 * Meta 데이터의 각 카테고리별 정보를 추출하는 유틸 함수들
 */

// 케이스1: 시술 용량/수량 정보 추출
function getVolumeQuantityInfo(meta: MetaTreatmentDetails, locale: string): string[] {
  const info: string[] = [];

  if (meta.volume) {
    info.push(`${getLocalizedLabel('volume', locale)}: ${meta.volume}`);
  }
  if (meta.quantity) {
    info.push(`${getLocalizedLabel('quantity', locale)}: ${meta.quantity}`);
  }
  if (meta.dosage) {
    info.push(`${getLocalizedLabel('dosage', locale)}: ${meta.dosage}`);
  }
  if (meta.shots) {
    info.push(`${getLocalizedLabel('shots', locale)}: ${meta.shots}${getLocalizedLabel('shotsUnit', locale)}`);
  }

  return info;
}

// 케이스2: 시술 방식/장비 정보 추출
function getMethodDeviceInfo(meta: MetaTreatmentDetails, locale: string): string[] {
  const info: string[] = [];

  if (meta.method) {
    info.push(`${getLocalizedLabel('method', locale)}: ${meta.method}`);
  }
  if (meta.mode) {
    info.push(`${getLocalizedLabel('mode', locale)}: ${meta.mode}`);
  }
  if (meta.device) {
    info.push(`${getLocalizedLabel('device', locale)}: ${meta.device}`);
  }
  if (meta.injection_type) {
    info.push(`${getLocalizedLabel('injectionType', locale)}: ${meta.injection_type}`);
  }

  return info;
}

// 케이스3: 패키지/업그레이드 정보 추출
function getPackageUpgradeInfo(meta: MetaTreatmentDetails, locale: string): string[] {
  const info: string[] = [];

  if (meta.package_type) {
    info.push(`${getLocalizedLabel('package', locale)}: ${meta.package_type}`);
  }
  if (meta.upgrade) {
    info.push(`${getLocalizedLabel('upgrade', locale)}: ${meta.upgrade}`);
  }
  if (meta.time_upgrade) {
    info.push(`${getLocalizedLabel('timeUpgrade', locale)}: ${meta.time_upgrade}`);
  }
  if (meta.volume_upgrade) {
    info.push(`${getLocalizedLabel('volumeUpgrade', locale)}: ${meta.volume_upgrade}`);
  }
  if (meta.stages) {
    info.push(`${meta.stages}${getLocalizedLabel('stageProgram', locale)}`);
  }
  if (meta.stage) {
    info.push(`${getLocalizedLabel('currentStage', locale)} ${meta.stage}${getLocalizedLabel('stage', locale)}`);
  }

  return info;
}

// 케이스4: 시술 대상/제한 정보 추출
function getTargetLimitInfo(meta: MetaTreatmentDetails, locale: string): string[] {
  const info: string[] = [];

  if (meta.gender) {
    const genderText = meta.gender === 'female'
      ? getLocalizedLabel('femaleOnly', locale)
      : getLocalizedLabel('maleOnly', locale);
    info.push(genderText);
  }

  if (meta.area) {
    // area가 배열인지 확인
    if (Array.isArray(meta.area) && meta.area.length > 0) {
      info.push(`${getLocalizedLabel('treatmentArea', locale)}: ${meta.area.join(', ')}`);
    } else if (typeof meta.area === 'string') {
      // 문자열인 경우 그대로 표시
      info.push(`${getLocalizedLabel('treatmentArea', locale)}: ${meta.area}`);
    }
  }

  if (meta.size_limit) {
    info.push(`${getLocalizedLabel('sizeLimit', locale)}: ${meta.size_limit}`);
  }
  if (meta.quantity_limit) {
    info.push(`${getLocalizedLabel('quantityLimit', locale)}: ${meta.quantity_limit}`);
  }

  if (meta.sedation) {
    info.push(getLocalizedLabel('sedation', locale));
  }

  return info;
}

// 케이스5: 설명/분류 정보 추출
function getDescriptionInfo(meta: MetaTreatmentDetails, locale: string): string[] {
  const info: string[] = [];

  if (meta.category) {
    info.push(`${getLocalizedLabel('category', locale)}: ${meta.category}`);
  }
  if (meta.common_name) {
    info.push(`${getLocalizedLabel('commonName', locale)}: ${meta.common_name}`);
  }
  if (meta.desc) {
    info.push(meta.desc);
  }

  if (meta.introduction) {
    const normalizedLocale = locale as SupportedLocale;
    // 지원하는 로케일 우선 확인, 없으면 ko -> en 순서로 폴백
    let introText: string | undefined;

    if (normalizedLocale === 'ko' || normalizedLocale === 'en' || normalizedLocale === 'ja') {
      introText = meta.introduction[normalizedLocale];
    } else if (normalizedLocale === 'zh-CN') {
      introText = meta.introduction['zh-CN'];
    } else if (normalizedLocale === 'zh-TW') {
      introText = meta.introduction['zh-TW'];
    }

    // 폴백: 현재 로케일에 없으면 ko -> en 순서로 확인
    introText = introText || meta.introduction.ko || meta.introduction.en;

    if (introText) info.push(introText);
  }

  if (meta.note) {
    info.push(`${getLocalizedLabel('caution', locale)}: ${meta.note}`);
  }

  if (meta.includes) {
    // includes가 배열인지 확인
    if (Array.isArray(meta.includes) && meta.includes.length > 0) {
      info.push(`${getLocalizedLabel('includes', locale)}: ${meta.includes.join(', ')}`);
    } else if (typeof meta.includes === 'string') {
      // 문자열인 경우 그대로 표시
      info.push(`${getLocalizedLabel('includes', locale)}: ${meta.includes}`);
    }
  }

  return info;
}

// 케이스6: 프로모션 정보 추출
function getPromotionInfo(meta: MetaTreatmentDetails, locale: string): string[] {
  const info: string[] = [];

  if (meta.promotion) {
    info.push(`${getLocalizedLabel('promotion', locale)}: ${meta.promotion}`);
  }

  if (meta.duration) {
    info.push(`${getLocalizedLabel('duration', locale)}: ${meta.duration}`);
  }

  return info;
}

/**
 * 시술 상세 정보를 표시하는 컴포넌트
 * 케이스별로 정보를 체계적으로 표시하며, 각 케이스는 독립적으로 제어 가능
 */
interface TreatmentDetailsDisplayProps {
  meta?: MetaTreatmentDetails;
  locale: string;
  // 각 케이스별 표시 여부를 제어할 수 있는 옵션
  showVolumeQuantity?: boolean;
  showMethodDevice?: boolean;
  showPackageUpgrade?: boolean;
  showTargetLimit?: boolean;
  showDescription?: boolean;
  showPromotion?: boolean;
}

const TreatmentDetailsDisplay = ({
  meta,
  locale,
  showVolumeQuantity = true,
  showMethodDevice = true,
  showPackageUpgrade = true,
  showTargetLimit = true,
  showDescription = true,
  showPromotion = true,
}: TreatmentDetailsDisplayProps) => {
  if (!meta) return null;

  // 각 케이스별 정보 추출
  const volumeQuantityInfo = showVolumeQuantity ? getVolumeQuantityInfo(meta, locale) : [];
  const methodDeviceInfo = showMethodDevice ? getMethodDeviceInfo(meta, locale) : [];
  const packageUpgradeInfo = showPackageUpgrade ? getPackageUpgradeInfo(meta, locale) : [];
  const targetLimitInfo = showTargetLimit ? getTargetLimitInfo(meta, locale) : [];
  const descriptionInfo = showDescription ? getDescriptionInfo(meta, locale) : [];
  const promotionInfo = showPromotion ? getPromotionInfo(meta, locale) : [];

  // 표시할 정보가 하나도 없으면 렌더링하지 않음
  const hasAnyInfo = [
    volumeQuantityInfo,
    methodDeviceInfo,
    packageUpgradeInfo,
    targetLimitInfo,
    descriptionInfo,
    promotionInfo
  ].some(arr => arr.length > 0);

  if (!hasAnyInfo) return null;

  return (
    <div className="mt-2 space-y-1 text-xs text-gray-600">
      {/* 케이스1: 시술 용량/수량 */}
      {volumeQuantityInfo.map((info, idx) => (
        <p key={`volume-${idx}`} className="flex items-start gap-1">
          <span className="text-blue-500">•</span>
          <span>{info}</span>
        </p>
      ))}

      {/* 케이스2: 시술 방식/장비 */}
      {methodDeviceInfo.map((info, idx) => (
        <p key={`method-${idx}`} className="flex items-start gap-1">
          <span className="text-green-500">•</span>
          <span>{info}</span>
        </p>
      ))}

      {/* 케이스3: 패키지/업그레이드 옵션 */}
      {packageUpgradeInfo.map((info, idx) => (
        <p key={`package-${idx}`} className="flex items-start gap-1">
          <span className="text-purple-500">•</span>
          <span>{info}</span>
        </p>
      ))}

      {/* 케이스4: 시술 대상/제한 */}
      {targetLimitInfo.map((info, idx) => (
        <p key={`target-${idx}`} className="flex items-start gap-1">
          <span className="text-orange-500">•</span>
          <span>{info}</span>
        </p>
      ))}

      {/* 케이스5: 설명/분류 */}
      {descriptionInfo.map((info, idx) => (
        <p key={`desc-${idx}`} className="flex items-start gap-1">
          <span className="text-gray-400">•</span>
          <span>{info}</span>
        </p>
      ))}

      {/* 케이스6: 프로모션 */}
      {promotionInfo.map((info, idx) => (
        <p key={`promo-${idx}`} className="flex items-start gap-1">
          <span className="text-red-500">⭐</span>
          <span className="font-medium text-red-600">{info}</span>
        </p>
      ))}
    </div>
  );
};

/**
 * 시술 상품 카드 컴포넌트
 * meta 데이터를 활용하여 가격 정보와 시술 상세 정보를 체계적으로 표시
 */
const TreatmentProductCard = ({ product }: TreatmentProductCardProps) => {
  const locale = useLocale();

  const nameText = locale === 'ko' ? product.name.ko : product.name.en;
  const unitText = locale === 'ko' ? product.unit.ko : product.unit.en;

  // 가격 정보 포맷팅
  const priceInfo = formatPriceInfo(product, locale);

  // option_value 표시 여부
  const hasOptionValue = product.option_value && product.option_value.trim() !== '';

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3 shadow-sm hover:shadow transition-shadow">
      {/* 상단: 상품명과 가격 */}
      <div className="flex justify-between items-start gap-3">
        {/* 좌측: 상품명 */}
        <div className="flex-1">
          <h5 className="text-sm font-medium text-gray-900">
            {nameText || '-'}
          </h5>
        </div>

        {/* 우측: 옵션값, 단위, 가격 */}
        <div className="flex-shrink-0">
          {/* 옵션 값 (기존 로직 유지) */}
          {hasOptionValue && Number(product.option_value) > 0 && (
            <p className="text-xs text-gray-500 mb-0.5">
              {product.option_value}
              {unitText && ` (${unitText})`}
            </p>
          )}

          {/* 가격 정보 표시 */}
          <PriceDisplay priceInfo={priceInfo} locale={locale} />
        </div>
      </div>

      {/* 하단: 시술 상세 정보 */}
      <TreatmentDetailsDisplay
        meta={product.meta}
        locale={locale}
        // 필요시 특정 케이스만 표시하도록 제어 가능
        // showPromotion={false} // 예: 프로모션 정보 숨기기
      />
    </div>
  );
};

export default TreatmentProductCard;
