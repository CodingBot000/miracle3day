/**
 * My Beauty Box 타입 정의
 */

export type ProductStatus = 'wishlist' | 'owned' | 'in_use' | 'used';

export interface BeautyBoxProduct {
  id: number;
  product_id: number;
  product_name: string;
  brand_name: string;
  price_krw: number | null;
  image_url: string | null;
  volume_text: string | null;
  category2: string | null;
  avg_rating: number | null;
  review_count: number | null;
  added_at: string;
  status: ProductStatus;
  memo: string | null;
  my_category: string | null;
  opened_at: string | null;
  expiry_date: string | null;
  use_by_date: string | null;
  finished_at: string | null;
}

export interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  recordId: number;
  productId?: number;
  changes?: Partial<BeautyBoxProduct>;
  timestamp: string;
}

export interface FilterSortState {
  sortBy: string;
  categories: string[];
  urgentOnly: boolean;
}

export interface SectionData {
  status: ProductStatus;
  products: BeautyBoxProduct[];
  urgentCount: number;
}

// 상태별 가능한 전환
export const STATUS_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  wishlist: ['owned', 'in_use'],
  owned: ['in_use', 'used'],
  in_use: ['used'],
  used: [],
};

// 상태별 섹션 정보
export const SECTION_CONFIG = {
  in_use: {
    order: 0,
    labelKo: '사용중',
    labelEn: 'In Use',
    bgColor: 'bg-purple-50',
    headerColor: 'text-purple-700',
    defaultExpanded: true,
  },
  owned: {
    order: 1,
    labelKo: '보유중/미개봉',
    labelEn: 'Owned (Unopened)',
    bgColor: 'bg-teal-50',
    headerColor: 'text-teal-700',
    defaultExpanded: true,
  },
  wishlist: {
    order: 2,
    labelKo: '위시리스트',
    labelEn: 'Wishlist',
    bgColor: 'bg-amber-50',
    headerColor: 'text-amber-700',
    defaultExpanded: true,
  },
  used: {
    order: 3,
    labelKo: '사용완료',
    labelEn: 'Finished',
    bgColor: 'bg-gray-50',
    headerColor: 'text-gray-600',
    defaultExpanded: false,
  },
} as const;

// 다국어 텍스트
export const TEXT = {
  ko: {
    // 섹션
    in_use: '사용중',
    owned: '보유중/미개봉',
    wishlist: '위시리스트',
    used: '사용완료',

    // 배지/상태
    expired: '만료됨',
    daysLeft: 'D-{days}',
    openedDays: '개봉 {days}일째',
    usedDays: '{days}일 사용',
    finishedOn: '완료 {date}',
    expiryOn: '유통 {date}',
    inputDate: '날짜 입력',
    userSetExpiry: '(사용자설정)',

    // 스와이프 액션
    delete: '삭제',
    moveToOwned: '보유중',
    startUsing: '사용시작',
    markDone: '완료',
    addAgain: '다시 담기',

    // 모달
    dateEditTitle: '날짜 편집',
    openedAt: '개봉일',
    expiryDate: '유통기한',
    useByDate: '2차 유통기한',
    finishedAt: '사용완료일',

    // 필터/정렬
    filterSort: '필터 & 정렬',
    sortBy: '정렬',
    filter: '필터',
    expiryAsc: '유통기한 임박순',
    expiryDesc: '유통기한 여유순',
    openedAsc: '개봉일순 (오래된)',
    openedDesc: '개봉일순 (최근)',
    addedDesc: '최근 추가순',
    addedAsc: '오래된 순',
    priceDesc: '가격 높은순',
    priceAsc: '가격 낮은순',
    urgentOnly: '임박 제품만 (D-30 이하)',
    reset: '초기화',
    apply: '적용하기',

    // 저장 버튼
    save: '저장',
    saving: '저장 중...',
    saved: '저장됨',
    saveFailed: '저장 실패',
    retry: '다시 시도',

    // 기타
    title: 'My Beauty Box',
    urgent: '개 임박',
    total: '총 {count}개',
    noProducts: '제품이 없습니다',
    addProducts: '제품 추가하기',
    deleteTitle: '제품 삭제',
    deleteMessage: '이 제품을 My Beauty Box에서 삭제하시겠습니까?',
    cancel: '취소',
    loading: '로딩 중...',
    error: '데이터를 불러오는데 실패했습니다',
  },
  en: {
    // 섹션
    in_use: 'In Use',
    owned: 'Owned (Unopened)',
    wishlist: 'Wishlist',
    used: 'Finished',

    // 배지/상태
    expired: 'Expired',
    daysLeft: 'D-{days}',
    openedDays: 'Opened {days}d ago',
    usedDays: 'Used {days}d',
    finishedOn: 'Done {date}',
    expiryOn: 'Exp {date}',
    inputDate: 'Add date',
    userSetExpiry: '(custom)',

    // 스와이프 액션
    delete: 'Delete',
    moveToOwned: 'Owned',
    startUsing: 'Start',
    markDone: 'Done',
    addAgain: 'Add again',

    // 모달
    dateEditTitle: 'Edit Dates',
    openedAt: 'Opened',
    expiryDate: 'Expiry',
    useByDate: 'Use by',
    finishedAt: 'Finished',

    // 필터/정렬
    filterSort: 'Filter & Sort',
    sortBy: 'Sort',
    filter: 'Filter',
    expiryAsc: 'Expiring soon',
    expiryDesc: 'Expiring later',
    openedAsc: 'Opened (oldest)',
    openedDesc: 'Opened (recent)',
    addedDesc: 'Recently added',
    addedAsc: 'Oldest first',
    priceDesc: 'Price high to low',
    priceAsc: 'Price low to high',
    urgentOnly: 'Urgent only (≤D-30)',
    reset: 'Reset',
    apply: 'Apply',

    // 저장 버튼
    save: 'Save',
    saving: 'Saving...',
    saved: 'Saved',
    saveFailed: 'Save failed',
    retry: 'Retry',

    // 기타
    title: 'My Beauty Box',
    urgent: ' urgent',
    total: '{count} items',
    noProducts: 'No products',
    addProducts: 'Add Products',
    deleteTitle: 'Delete Product',
    deleteMessage: 'Remove this product from My Beauty Box?',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Failed to load data',
  },
} as const;

export function getTexts(locale: string) {
  return TEXT[locale as keyof typeof TEXT] || TEXT.en;
}
