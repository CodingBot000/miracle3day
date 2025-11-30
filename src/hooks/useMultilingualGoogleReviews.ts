/**
 * 다국어 Google 리뷰 조회 훅
 *
 * DB에 캐싱된 리뷰를 언어별로 조회합니다.
 * Google API를 직접 호출하지 않습니다.
 */

import { useQuery } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface Review {
  reviewKey: string;
  authorName?: string;
  authorPhotoUrl?: string;
  authorProfileUrl?: string;
  rating?: number;
  reviewText: string;
  publishTime?: string;
}

export interface GoogleReviewsResponse {
  placeId?: string;
  rating?: number;
  userRatingCount?: number;
  lastSyncedAt?: string;
  reviews: Review[];
}

// ============================================================================
// Utilities
// ============================================================================

const SUPPORTED_LANGS = ['en', 'ko', 'zh-CN', 'zh-TW', 'ja'] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

/**
 * 언어 결정 로직:
 * 1. 명시적으로 전달된 locale 사용
 * 2. 없으면 브라우저 언어 감지
 * 3. 지원 언어가 아니면 'en' 폴백
 */
function getPreferredLanguage(locale?: string): SupportedLang {
  // 1. 명시적 locale
  if (locale) {
    // zh-CN, zh-TW 처리
    if (locale === 'zh-CN' || locale === 'zh-TW') {
      return locale;
    }
    // zh-Hans, zh-Hant 처리
    if (locale.startsWith('zh')) {
      return locale.includes('TW') || locale.includes('Hant') ? 'zh-TW' : 'zh-CN';
    }
    const shortLang = locale.split('-')[0].toLowerCase();
    if (SUPPORTED_LANGS.includes(shortLang as SupportedLang)) {
      return shortLang as SupportedLang;
    }
  }

  // 2. 브라우저 언어
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language;
    // zh 계열 처리
    if (browserLang.startsWith('zh')) {
      return browserLang.includes('TW') || browserLang.includes('Hant')
        ? 'zh-TW'
        : 'zh-CN';
    }
    const shortLang = browserLang.split('-')[0].toLowerCase();
    if (SUPPORTED_LANGS.includes(shortLang as SupportedLang)) {
      return shortLang as SupportedLang;
    }
  }

  // 3. 기본값
  return 'en';
}

// ============================================================================
// Hook
// ============================================================================

interface UseMultilingualGoogleReviewsOptions {
  locale?: string; // 명시적 언어 설정 (웹사이트 언어 설정)
  enabled?: boolean;
}

/**
 * 다국어 Google 리뷰 조회 훅
 *
 * @param hospitalId - 병원 UUID
 * @param options.locale - 명시적 언어 설정 (없으면 브라우저 언어 사용)
 * @param options.enabled - 쿼리 활성화 여부
 *
 * @example
 * ```tsx
 * const locale = useLocale(); // next-intl
 * const { data, isLoading } = useMultilingualGoogleReviews(hospitalId, { locale });
 * ```
 */
export function useMultilingualGoogleReviews(
  hospitalId: string | null | undefined,
  options?: UseMultilingualGoogleReviewsOptions
) {
  const { locale, enabled = true } = options ?? {};
  const lang = getPreferredLanguage(locale);

  return useQuery<GoogleReviewsResponse>({
    queryKey: ['hospitalGoogleReviews', hospitalId, lang],
    queryFn: async () => {
      const res = await fetch(
        `/api/hospital/${hospitalId}/google-reviews?lang=${lang}`
      );
      if (!res.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return res.json();
    },
    enabled: enabled && !!hospitalId,
    staleTime: 1000 * 60 * 60, // 1시간 (DB 데이터이므로 긴 캐시)
    gcTime: 1000 * 60 * 60 * 24, // 24시간
  });
}

/**
 * 브라우저 언어 코드 반환 (외부에서 사용 가능)
 */
export function getBrowserLanguage(): SupportedLang {
  return getPreferredLanguage();
}
