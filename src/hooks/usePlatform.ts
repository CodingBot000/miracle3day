import { useEffect, useState } from 'react';
import {
  isWebView,
  isAndroidWebView,
  isIOSWebView,
  isMobileBrowser,
  isDesktopBrowser,
  getPlatformType,
  getWebViewVersion,
  type PlatformType
} from '@/utils/userAgent';

/**
 * 플랫폼 정보를 제공하는 React Hook
 *
 * @example
 * const { isWebView, isAndroidWebView, platformType } = usePlatform();
 *
 * if (isWebView) {
 *   // 웹뷰 전용 로직
 * }
 */
export const usePlatform = () => {
  const [platformInfo, setPlatformInfo] = useState<{
    isWebView: boolean;
    isAndroidWebView: boolean;
    isIOSWebView: boolean;
    isMobileBrowser: boolean;
    isDesktopBrowser: boolean;
    platformType: PlatformType;
    webViewVersion: string | null;
    isClient: boolean;
  }>({
    isWebView: false,
    isAndroidWebView: false,
    isIOSWebView: false,
    isMobileBrowser: false,
    isDesktopBrowser: false,
    platformType: 'server',
    webViewVersion: null,
    isClient: false
  });

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    setPlatformInfo({
      isWebView: isWebView(),
      isAndroidWebView: isAndroidWebView(),
      isIOSWebView: isIOSWebView(),
      isMobileBrowser: isMobileBrowser(),
      isDesktopBrowser: isDesktopBrowser(),
      platformType: getPlatformType(),
      webViewVersion: getWebViewVersion(),
      isClient: true
    });
  }, []);

  return platformInfo;
};

/**
 * 웹뷰 전용 기능을 제공하는 Hook
 *
 * @example
 * const { isReady, callNativeFunction } = useWebViewBridge();
 *
 * if (isReady) {
 *   callNativeFunction('showToast', { message: 'Hello' });
 * }
 */
export const useWebViewBridge = () => {
  const { isWebView: isInWebView, isAndroidWebView: isInAndroidWebView } = usePlatform();

  /**
   * Android 네이티브 함수 호출
   * (Android에서 window.AndroidBridge 인터페이스를 제공해야 함)
   */
  const callAndroidFunction = (functionName: string, ...args: any[]) => {
    if (!isInAndroidWebView || typeof window === 'undefined') {
      console.warn(`[WebView Bridge] Not in Android WebView. Cannot call: ${functionName}`);
      return;
    }

    try {
      // @ts-ignore - Android 브릿지 타입 정의는 별도로 필요
      if (window.AndroidBridge && typeof window.AndroidBridge[functionName] === 'function') {
        // @ts-ignore
        return window.AndroidBridge[functionName](...args);
      } else {
        console.warn(`[WebView Bridge] Android function not found: ${functionName}`);
      }
    } catch (error) {
      console.error(`[WebView Bridge] Error calling ${functionName}:`, error);
    }
  };

  /**
   * iOS 네이티브 함수 호출 (추후 구현)
   */
  const callIOSFunction = (functionName: string, ...args: any[]) => {
    console.warn('[WebView Bridge] iOS bridge not implemented yet');
  };

  /**
   * 플랫폼에 맞는 네이티브 함수 호출
   */
  const callNativeFunction = (functionName: string, ...args: any[]) => {
    if (isInAndroidWebView) {
      return callAndroidFunction(functionName, ...args);
    }
    // iOS 추가 가능
    console.warn('[WebView Bridge] Not in a supported WebView environment');
  };

  return {
    isReady: isInWebView,
    isAndroidWebView: isInAndroidWebView,
    callAndroidFunction,
    callIOSFunction,
    callNativeFunction
  };
};
