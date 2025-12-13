export const getPlatform = () => {
  if (typeof window === 'undefined') return 'server';

  const ua = navigator.userAgent;

  // 안드로이드 웹뷰
  if (/Android/.test(ua) && /wv/.test(ua)) return 'android-webview';

  // iOS 웹뷰
  if (/iPhone|iPad|iPod/.test(ua) && /AppleWebKit/.test(ua) && !/(Safari|CriOS|FxiOS)/.test(ua)) {
    return 'ios-webview';
  }

  return 'web';
};

export const isWebView = () => {
  const platform = getPlatform();
  return platform === 'android-webview' || platform === 'ios-webview';
};

export const isWeb = () => getPlatform() === 'web';
