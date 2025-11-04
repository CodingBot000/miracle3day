'use client';

import React from 'react';
import { usePlatform, useWebViewBridge } from '@/hooks/usePlatform';

/**
 * 플랫폼 감지 및 정보 표시 컴포넌트 (디버깅용)
 *
 * @example
 * import { PlatformDetector } from '@/components/PlatformDetector';
 *
 * // 개발 환경에서만 표시
 * {process.env.NODE_ENV === 'development' && <PlatformDetector />}
 */
export const PlatformDetector: React.FC<{ showDetails?: boolean }> = ({ showDetails = false }) => {
  const platform = usePlatform();

  if (!platform.isClient) {
    return null; // SSR 중에는 렌더링하지 않음
  }

  if (!showDetails) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        플랫폼 정보
      </div>
      <div style={{ lineHeight: '1.6' }}>
        <div>타입: {platform.platformType}</div>
        <div>웹뷰: {platform.isWebView ? '✅' : '❌'}</div>
        {platform.isAndroidWebView && (
          <div>Android 웹뷰: ✅ (v{platform.webViewVersion})</div>
        )}
        {platform.isIOSWebView && <div>iOS 웹뷰: ✅</div>}
        {platform.isMobileBrowser && <div>모바일 브라우저: ✅</div>}
        {platform.isDesktopBrowser && <div>데스크톱 브라우저: ✅</div>}
      </div>
    </div>
  );
};

/**
 * 웹뷰 전용 기능을 조건부로 렌더링하는 래퍼 컴포넌트
 *
 * @example
 * <WebViewOnly>
 *   <button onClick={() => callNativeFunction('openCamera')}>
 *     카메라 열기
 *   </button>
 * </WebViewOnly>
 */
export const WebViewOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => {
  const { isWebView } = usePlatform();

  if (!isWebView) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * 일반 웹 브라우저에서만 표시되는 컴포넌트
 *
 * @example
 * <BrowserOnly>
 *   <InstallAppBanner />
 * </BrowserOnly>
 */
export const BrowserOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isWebView } = usePlatform();

  if (isWebView) {
    return null;
  }

  return <>{children}</>;
};

/**
 * 플랫폼별로 다른 컴포넌트를 렌더링
 *
 * @example
 * <PlatformSwitch
 *   webView={<WebViewHeader />}
 *   browser={<BrowserHeader />}
 * />
 */
export const PlatformSwitch: React.FC<{
  webView?: React.ReactNode;
  androidWebView?: React.ReactNode;
  iosWebView?: React.ReactNode;
  mobileBrowser?: React.ReactNode;
  desktopBrowser?: React.ReactNode;
  browser?: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({
  webView,
  androidWebView,
  iosWebView,
  mobileBrowser,
  desktopBrowser,
  browser,
  fallback = null
}) => {
  const platform = usePlatform();

  if (!platform.isClient) {
    return <>{fallback}</>;
  }

  // 세부적인 플랫폼별 분기
  if (platform.isAndroidWebView && androidWebView) {
    return <>{androidWebView}</>;
  }

  if (platform.isIOSWebView && iosWebView) {
    return <>{iosWebView}</>;
  }

  // 웹뷰 통합
  if (platform.isWebView && webView) {
    return <>{webView}</>;
  }

  // 브라우저 세부 분기
  if (platform.isMobileBrowser && mobileBrowser) {
    return <>{mobileBrowser}</>;
  }

  if (platform.isDesktopBrowser && desktopBrowser) {
    return <>{desktopBrowser}</>;
  }

  // 브라우저 통합
  if (!platform.isWebView && browser) {
    return <>{browser}</>;
  }

  return <>{fallback}</>;
};

/**
 * 웹뷰 브릿지 테스트 컴포넌트 (개발용)
 */
export const WebViewBridgeTest: React.FC = () => {
  const { isReady, callNativeFunction } = useWebViewBridge();

  if (!isReady) {
    return <div>웹뷰 환경이 아닙니다.</div>;
  }

  const testNativeCall = () => {
    // Android에서 window.AndroidBridge.showToast(message) 메서드를 제공해야 함
    callNativeFunction('showToast', 'Hello from WebView!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>웹뷰 브릿지 테스트</h3>
      <button
        onClick={testNativeCall}
        style={{
          padding: '10px 20px',
          backgroundColor: '#FB718F',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        네이티브 함수 호출 테스트
      </button>
    </div>
  );
};
