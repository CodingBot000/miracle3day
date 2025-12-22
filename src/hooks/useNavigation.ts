'use client';

import { useRouter } from '@/i18n/routing';
import { getPlatform, isWeb } from '@/lib/platform';

/**
 * 다국어 페이지용 Navigation Hook
 *
 * ⚠️ Admin 페이지에서는 사용하지 마세요!
 * Admin에서는 next/navigation의 useRouter를 직접 사용하세요.
 */
export const useNavigation = () => {
  const router = useRouter();

  /**
   * 페이지 이동 (SPA 방식 유지)
   * @param href - 이동할 경로
   * @param options.newWindow - 새창으로 열기 여부 (웹만 적용, 웹뷰는 현재창)
   * @param options.replace - 히스토리 교체 여부 (뒤로가기 안됨)
   * @param options.locale - 다국어 locale 지정 (next-intl)
   */
  const navigate = (href: string, options?: {
    newWindow?: boolean;
    replace?: boolean;
    locale?: string;
  }) => {
    const { newWindow = false, replace = false, locale } = options || {};

    if (newWindow) {
      if (isWeb()) {
        // 웹: 새창 열기
        window.open(href, '_blank');
      } else {
        // 웹뷰: 현재창에서 이동 (뒤로가기 가능하도록)
        replace
          ? router.replace(href, { locale, scroll: true })
          : router.push(href, { locale, scroll: true });
      }
    } else {
      // 일반 이동: 모든 플랫폼 동일
      replace
        ? router.replace(href, { locale, scroll: true })
        : router.push(href, { locale, scroll: true });
    }
  };

  /**
   * 뒤로가기
   * - router.back() 사용 (OAuth 히스토리 문제 방지)
   * - 웹에서 새창인 경우 창 닫기
   */
  const goBack = () => {
    // 웹에서 새창으로 열린 경우
    if (isWeb() && window.opener) {
      window.close();
      return;
    }

    // Next.js router.back() 사용 (OAuth 히스토리를 안전하게 처리)
    router.back();
  };

  /**
   * 현재 페이지 새로고침 (서버 데이터 재검증)
   */
  const refresh = () => {
    router.refresh();
  };

  return {
    navigate,
    goBack,
    refresh,
    platform: getPlatform()
  };
};
