export const ANONYMOUS_CATEGORY_NAME = 'anonymous'

export function isAnonymousCategoryName(name?: string | null) {
  if (!name) return false
  return name.trim().toLowerCase() === ANONYMOUS_CATEGORY_NAME
}

export const ANONYMOUS_FALLBACK = {
  name: 'Anonymous',
  avatar: '/logo/logo_icon.png',
}

// ============================================
// 카테고리 색상 시스템
// ============================================

/**
 * Topic 색상 (category_type: 'topic')
 * - badge: 카드에서 사용 (파스텔 배경 + 진한 텍스트)
 * - filter: 네비게이션 필터 선택 시 (진한 배경 + 흰 텍스트)
 */
export const topicColors: Record<string, { badge: string; filter: string }> = {
  antiaging: {
    badge: 'bg-rose-100 text-rose-700',
    filter: 'bg-rose-500 text-white',
  },
  wrinkles: {
    badge: 'bg-purple-100 text-purple-700',
    filter: 'bg-purple-500 text-white',
  },
  pigmentation: {
    badge: 'bg-amber-100 text-amber-700',
    filter: 'bg-amber-500 text-white',
  },
  acne: {
    badge: 'bg-sky-100 text-sky-700',
    filter: 'bg-sky-500 text-white',
  },
  surgery: {
    badge: 'bg-indigo-100 text-indigo-700',
    filter: 'bg-indigo-500 text-white',
  },
};

/**
 * Tag 색상 (category_type: 'free')
 * - badge: 카드에서 사용 (아웃라인 스타일)
 * - filter: 네비게이션 필터 선택 시 (진한 배경 + 흰 텍스트)
 */
export const tagColors: Record<string, { badge: string; filter: string }> = {
  question: {
    badge: 'border border-gray-300 text-gray-600 bg-white',
    filter: 'bg-gray-600 text-white',
  },
  review: {
    badge: 'border border-emerald-300 text-emerald-600 bg-white',
    filter: 'bg-emerald-500 text-white',
  },
  discussion: {
    badge: 'border border-blue-300 text-blue-600 bg-white',
    filter: 'bg-blue-500 text-white',
  },
};

/**
 * 기본 색상 (All 버튼 및 fallback)
 */
export const categoryDefaultColors = {
  filterSelected: 'bg-pink-600 text-white',
  filterUnselected: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
};

// ============================================
// 헬퍼 함수
// ============================================

/**
 * Topic 뱃지 클래스 반환 (카드용)
 */
export function getTopicBadgeClass(topicId: string): string {
  return topicColors[topicId]?.badge || 'bg-gray-100 text-gray-700';
}

/**
 * Tag 뱃지 클래스 반환 (카드용)
 */
export function getTagBadgeClass(tagId: string): string {
  return tagColors[tagId]?.badge || 'border border-gray-300 text-gray-600 bg-white';
}

/**
 * 필터 버튼 클래스 반환 (네비게이션용)
 * @param categoryId - 카테고리 ID (null이면 'All' 버튼)
 * @param isSelected - 현재 선택된 상태인지
 * @param categoryType - 'topic' | 'free'
 */
export function getFilterButtonClass(
  categoryId: string | null,
  isSelected: boolean,
  categoryType: 'topic' | 'free'
): string {
  if (!isSelected) {
    return categoryDefaultColors.filterUnselected;
  }

  // All 버튼 선택 시
  if (categoryId === null) {
    return categoryDefaultColors.filterSelected;
  }

  // 개별 카테고리 선택 시
  if (categoryType === 'topic') {
    return topicColors[categoryId]?.filter || categoryDefaultColors.filterSelected;
  }

  return tagColors[categoryId]?.filter || categoryDefaultColors.filterSelected;
}
