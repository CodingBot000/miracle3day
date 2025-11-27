import { log } from '@/utils/logger';
/**
 * User-Agent 감지 유틸리티
 * 웹뷰 환경과 일반 웹 환경을 구분하기 위한 함수들
 */

// 웹뷰 식별자 상수
const WEBVIEW_IDENTIFIERS = {
  ANDROID: 'MyAppWebView',
  IOS: 'MyAppWebView/iOS'
} as const;

/**
 * 현재 환경이 Android 웹뷰인지 확인
 */
export const isAndroidWebView = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent;
  return userAgent.includes(WEBVIEW_IDENTIFIERS.ANDROID);
};

/**
 * 현재 환경이 iOS 웹뷰인지 확인
 */
export const isIOSWebView = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent;

  // 우선 커스텀 식별자 확인
  if (userAgent.includes(WEBVIEW_IDENTIFIERS.IOS)) {
    return true;
  }

  // 일반적인 iOS 웹뷰 감지 (WKWebView, UIWebView)
  return /iPhone|iPad|iPod/.test(userAgent) &&
         (userAgent.includes('WebView') || !userAgent.includes('Safari'));
};

/**
 * 현재 환경이 웹뷰인지 확인 (Android 또는 iOS)
 */
export const isWebView = (): boolean => {
  return isAndroidWebView() || isIOSWebView();
};

/**
 * 현재 환경이 일반 모바일 브라우저인지 확인
 */
export const isMobileBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
         && !isWebView();
};

/**
 * 현재 환경이 데스크톱 브라우저인지 확인
 */
export const isDesktopBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;

  return !isMobileBrowser() && !isWebView();
};

/**
 * 플랫폼 타입
 */
export type PlatformType = 'android_webview' | 'ios_webview' | 'mobile_browser' | 'desktop_browser' | 'server';

/**
 * 현재 플랫폼 타입 반환
 */
export const getPlatformType = (): PlatformType => {
  if (typeof window === 'undefined') return 'server';

  if (isAndroidWebView()) return 'android_webview';
  if (isIOSWebView()) return 'ios_webview';
  if (isMobileBrowser()) return 'mobile_browser';
  return 'desktop_browser';
};

/**
 * User-Agent 문자열 반환
 */
export const getUserAgent = (): string => {
  if (typeof window === 'undefined') return '';
  return window.navigator.userAgent;
};

/**
 * 웹뷰 버전 추출 (예: "MyAppWebView/1.0" -> "1.0", "MyAppWebView/iOS/2.0" -> "2.0")
 */
export const getWebViewVersion = (): string | null => {
  const userAgent = getUserAgent();

  // Android 버전
  if (isAndroidWebView()) {
    const match = userAgent.match(/MyAppWebView\/([\d.]+)/);
    return match ? match[1] : null;
  }

  // iOS 버전
  if (isIOSWebView()) {
    const match = userAgent.match(/MyAppWebView\/iOS\/([\d.]+)/);
    return match ? match[1] : null;
  }

  return null;
};

/**
 * 환경별 동작을 위한 헬퍼 함수
 */
export const executeByPlatform = <T>(handlers: {
  androidWebView?: () => T;
  iosWebView?: () => T;
  mobileBrowser?: () => T;
  desktopBrowser?: () => T;
  default: () => T;
}): T => {
  const platform = getPlatformType();

  switch (platform) {
    case 'android_webview':
      return handlers.androidWebView?.() ?? handlers.default();
    case 'ios_webview':
      return handlers.iosWebView?.() ?? handlers.default();
    case 'mobile_browser':
      return handlers.mobileBrowser?.() ?? handlers.default();
    case 'desktop_browser':
      return handlers.desktopBrowser?.() ?? handlers.default();
    default:
      return handlers.default();
  }
};

/**
 * 디버깅용 플랫폼 정보 출력
 */
export const logPlatformInfo = (): void => {
  if (typeof window === 'undefined') {
    log.debug('[Platform] Server-side rendering');
    return;
  }

  log.debug('[Platform Info]', {
    platformType: getPlatformType(),
    isWebView: isWebView(),
    isAndroidWebView: isAndroidWebView(),
    isIOSWebView: isIOSWebView(),
    isMobileBrowser: isMobileBrowser(),
    isDesktopBrowser: isDesktopBrowser(),
    webViewVersion: getWebViewVersion(),
    userAgent: getUserAgent()
  });
};
