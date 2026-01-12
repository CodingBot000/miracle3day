/**
 * Beauty Box 날짜 계산 유틸리티
 */

import { BeautyBoxProduct } from '../types';

/**
 * 남은 기한 계산 (D-day)
 * 2차유통기한 > 유통기한 > null 우선순위
 */
export function getDaysRemaining(product: BeautyBoxProduct): number | null {
  const effectiveExpiry = product.use_by_date || product.expiry_date;
  if (!effectiveExpiry) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(effectiveExpiry);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 개봉 후 경과일 계산
 */
export function getDaysSinceOpened(openedAt: string | null): number | null {
  if (!openedAt) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const opened = new Date(openedAt);
  opened.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - opened.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 총 사용 기간 계산 (used 상태용)
 */
export function getUsageDuration(openedAt: string | null, finishedAt: string | null): number | null {
  if (!openedAt || !finishedAt) return null;

  const opened = new Date(openedAt);
  const finished = new Date(finishedAt);

  const diffTime = finished.getTime() - opened.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * D-day 배지 스타일
 */
export interface ExpiryBadgeStyle {
  color: string;
  bgColor: string;
  text: string;
  isUserSet?: boolean;
}

export function getExpiryBadgeStyle(
  daysRemaining: number | null,
  hasUseByDate: boolean = false,
  locale: string = 'ko'
): ExpiryBadgeStyle {
  if (daysRemaining === null) {
    return {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      text: locale === 'ko' ? '날짜 입력' : 'Add date',
    };
  }
  if (daysRemaining < 0) {
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      text: locale === 'ko' ? '만료됨' : 'Expired',
    };
  }
  if (daysRemaining <= 7) {
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      text: `D-${daysRemaining}`,
      isUserSet: hasUseByDate,
    };
  }
  if (daysRemaining <= 30) {
    return {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      text: `D-${daysRemaining}`,
      isUserSet: hasUseByDate,
    };
  }
  return {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    text: `D-${daysRemaining}`,
    isUserSet: hasUseByDate,
  };
}

/**
 * 날짜 포맷팅
 */
export function formatDate(dateStr: string | null, locale: string = 'ko'): string {
  if (!dateStr) return '-';

  const date = new Date(dateStr);

  if (locale === 'ko') {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * 오늘 날짜 문자열 반환 (YYYY-MM-DD)
 */
export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * 상태별 표시 정보 생성
 */
export function getStatusDisplayInfo(
  product: BeautyBoxProduct,
  locale: string = 'ko'
): {
  primaryInfo: string | null;
  secondaryInfo: string | null;
  badge: ExpiryBadgeStyle | null;
} {
  const t = locale === 'ko' ? textKo : textEn;

  switch (product.status) {
    case 'wishlist':
      return {
        primaryInfo: t.addedOn.replace('{date}', formatDate(product.added_at, locale)),
        secondaryInfo: null,
        badge: null,
      };

    case 'owned': {
      const daysRemaining = product.expiry_date ? getDaysRemaining(product) : null;
      return {
        primaryInfo: daysRemaining !== null
          ? t.expiryOn.replace('{date}', formatDate(product.expiry_date, locale))
          : null,
        secondaryInfo: null,
        badge: getExpiryBadgeStyle(daysRemaining, false, locale),
      };
    }

    case 'in_use': {
      const daysRemaining = getDaysRemaining(product);
      const daysSinceOpened = getDaysSinceOpened(product.opened_at);
      return {
        primaryInfo: daysSinceOpened !== null
          ? t.openedDays.replace('{days}', String(daysSinceOpened))
          : null,
        secondaryInfo: null,
        badge: getExpiryBadgeStyle(daysRemaining, !!product.use_by_date, locale),
      };
    }

    case 'used': {
      const usageDays = getUsageDuration(product.opened_at, product.finished_at);
      return {
        primaryInfo: t.finishedOn.replace('{date}', formatDate(product.finished_at, locale)),
        secondaryInfo: usageDays !== null
          ? t.usedDays.replace('{days}', String(usageDays))
          : null,
        badge: null,
      };
    }

    default:
      return { primaryInfo: null, secondaryInfo: null, badge: null };
  }
}

const textKo = {
  addedOn: '추가 {date}',
  expiryOn: '유통 {date}',
  openedDays: '개봉 {days}일째',
  finishedOn: '완료 {date}',
  usedDays: '({days}일 사용)',
};

const textEn = {
  addedOn: 'Added {date}',
  expiryOn: 'Exp {date}',
  openedDays: 'Opened {days}d ago',
  finishedOn: 'Done {date}',
  usedDays: '({days}d used)',
};

/**
 * 섹션별 정렬
 */
export function sortProductsBySection(
  products: BeautyBoxProduct[],
  sortType: string = 'added_desc'
): BeautyBoxProduct[] {
  const sorted = [...products];

  switch (sortType) {
    case 'expiry_asc':
      return sorted.sort((a, b) => {
        const daysA = getDaysRemaining(a) ?? Infinity;
        const daysB = getDaysRemaining(b) ?? Infinity;
        return daysA - daysB;
      });

    case 'expiry_desc':
      return sorted.sort((a, b) => {
        const daysA = getDaysRemaining(a) ?? -Infinity;
        const daysB = getDaysRemaining(b) ?? -Infinity;
        return daysB - daysA;
      });

    case 'opened_asc':
      return sorted.sort((a, b) => {
        if (!a.opened_at) return 1;
        if (!b.opened_at) return -1;
        return new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime();
      });

    case 'opened_desc':
      return sorted.sort((a, b) => {
        if (!a.opened_at) return 1;
        if (!b.opened_at) return -1;
        return new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime();
      });

    case 'added_asc':
      return sorted.sort((a, b) => {
        return new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
      });

    case 'added_desc':
    default:
      return sorted.sort((a, b) => {
        return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
      });

    case 'price_desc':
      return sorted.sort((a, b) => {
        return (b.price_krw ?? 0) - (a.price_krw ?? 0);
      });

    case 'price_asc':
      return sorted.sort((a, b) => {
        return (a.price_krw ?? 0) - (b.price_krw ?? 0);
      });
  }
}

/**
 * 임박 제품 필터 (D-30 이하)
 */
export function filterUrgentProducts(products: BeautyBoxProduct[]): BeautyBoxProduct[] {
  return products.filter((p) => {
    const days = getDaysRemaining(p);
    return days !== null && days <= 30;
  });
}

/**
 * 카테고리별 필터
 */
export function filterByCategory(
  products: BeautyBoxProduct[],
  category: string | null
): BeautyBoxProduct[] {
  if (!category) return products;
  return products.filter((p) => p.category2 === category);
}

/**
 * 임박 제품 수 카운트
 */
export function countUrgentProducts(products: BeautyBoxProduct[]): number {
  return products.filter((p) => {
    const days = getDaysRemaining(p);
    return days !== null && days <= 30 && days >= 0;
  }).length;
}
