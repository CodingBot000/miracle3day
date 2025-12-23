/**
 * 디바이스 타입 감지 유틸리티
 * - User-Agent 기반 실제 디바이스 타입 감지
 * - 화면 크기 기반 반응형 레이아웃 감지
 * - WebView 및 앱 환경 감지
 * - 터치 스크린 지원 여부 감지
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * 종합 디바이스 정보
 */
export interface DeviceInfo {
  /** 현재 화면 크기 기반 디바이스 타입 (Tailwind breakpoint) */
  type: DeviceType;
  /** User-Agent 기반 실제 디바이스 타입 */
  actualDeviceType: DeviceType;
  /** 터치 스크린 지원 여부 */
  hasTouch: boolean;
  /** WebView 환경 여부 */
  isWebView: boolean;
  /** 현재 화면 너비 */
  screenWidth: number;
  /** 실제 모바일 기기인지 (모바일 User-Agent) */
  isRealMobile: boolean;
  /** 데스크탑에서 브라우저 창만 작게 한 것인지 */
  isDesktopSmallWindow: boolean;
  /** Mimotok 앱에서 접속했는지 */
  isMimotokApp: boolean;
}

/**
 * User-Agent 문자열을 가져옵니다.
 * SSR 환경에서는 빈 문자열을 반환합니다.
 *
 * @returns User-Agent 문자열
 */
function getUserAgent(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return '';
  }
  return navigator.userAgent || '';
}

/**
 * User-Agent를 기반으로 실제 디바이스 타입을 감지합니다.
 *
 * @returns 실제 디바이스 타입
 *
 * @example
 * ```typescript
 * const deviceType = getActualDeviceType();
 * if (deviceType === 'mobile') {
 *   console.log('실제 모바일 기기입니다');
 * }
 * ```
 */
export function getActualDeviceType(): DeviceType {
  const ua = getUserAgent();
  if (!ua) return 'desktop';

  // 모바일 디바이스 패턴
  const mobilePattern = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i;
  if (mobilePattern.test(ua)) {
    return 'mobile';
  }

  // 태블릿 디바이스 패턴
  // iPad, Android 태블릿 등
  const tabletPattern = /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i;
  if (tabletPattern.test(ua)) {
    return 'tablet';
  }

  return 'desktop';
}

/**
 * 터치 스크린 지원 여부를 감지합니다.
 *
 * @returns 터치 스크린 지원 여부
 *
 * @example
 * ```typescript
 * if (isTouchDevice()) {
 *   console.log('터치 인터페이스 활성화');
 * }
 * ```
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // 터치 이벤트 지원 확인
  if ('ontouchstart' in window) return true;

  // 터치 포인트 수 확인
  if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) return true;

  // IE/Edge 레거시 지원
  if ((navigator as any).msMaxTouchPoints && (navigator as any).msMaxTouchPoints > 0) return true;

  return false;
}

/**
 * Android WebView 환경인지 감지합니다.
 *
 * @returns Android WebView 여부
 *
 * @example
 * ```typescript
 * if (isAndroidWebView()) {
 *   console.log('Android 앱의 WebView에서 실행 중');
 * }
 * ```
 */
export function isAndroidWebView(): boolean {
  const ua = getUserAgent();
  if (!ua) return false;

  // Android가 아니면 false
  if (!/android/i.test(ua)) return false;

  // Android WebView 감지
  // 1. 'wv' 포함 (Android 4.4+)
  if (/wv/i.test(ua)) return true;

  // 2. Android + Version/ 포함 (구형 WebView)
  if (/android/i.test(ua) && /version\//i.test(ua)) {
    // Chrome이 아닌 경우 WebView로 판단
    if (!/chrome/i.test(ua)) return true;
  }

  return false;
}

/**
 * Mimotok 앱에서 접속했는지 감지합니다.
 * User-Agent에 'MyAppWebView' 또는 window.RUNTIME_ENV 확인
 *
 * @returns Mimotok 앱 환경 여부
 *
 * @example
 * ```typescript
 * if (isMimotokApp()) {
 *   console.log('Mimotok 앱에서 접속');
 * }
 * ```
 */
export function isMimotokApp(): boolean {
  const ua = getUserAgent();

  // User-Agent에서 확인
  if (ua && /MyAppWebView/i.test(ua)) return true;

  // window.RUNTIME_ENV에서 확인 (layout.tsx의 runtime-env 스크립트 참조)
  if (typeof window !== 'undefined' && (window as any).RUNTIME_ENV) {
    return (window as any).RUNTIME_ENV.inWebView === true;
  }

  return false;
}

/**
 * 현재 화면 너비를 기반으로 디바이스 타입을 감지합니다.
 * 기존 함수와 동일 (호환성 유지)
 *
 * @returns 디바이스 타입
 *
 * @example
 * ```typescript
 * const type = getDeviceType();
 * // 'mobile' | 'tablet' | 'desktop'
 * ```
 *
 * Tailwind CSS breakpoints:
 * - mobile: < 768px
 * - tablet: 768px ~ 1023px
 * - desktop: >= 1024px
 */
export function getDeviceType(): DeviceType {
  // SSR 환경에서는 desktop을 기본값으로 반환
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;

  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * 종합적인 디바이스 정보를 반환합니다.
 * 화면 크기, User-Agent, 터치 지원, WebView 여부 등 모든 정보를 포함합니다.
 *
 * @returns 종합 디바이스 정보
 *
 * @example
 * ```typescript
 * const deviceInfo = getDeviceInfo();
 *
 * console.log('화면 크기 기반 타입:', deviceInfo.type);
 * console.log('실제 디바이스 타입:', deviceInfo.actualDeviceType);
 * console.log('터치 지원:', deviceInfo.hasTouch);
 * console.log('WebView:', deviceInfo.isWebView);
 * console.log('Mimotok 앱:', deviceInfo.isMimotokApp);
 *
 * if (deviceInfo.isDesktopSmallWindow) {
 *   console.log('데스크탑에서 브라우저 창을 작게 조정한 상태입니다');
 * }
 *
 * if (deviceInfo.isRealMobile) {
 *   console.log('실제 모바일 기기입니다');
 * }
 * ```
 */
export function getDeviceInfo(): DeviceInfo {
  // SSR 환경 기본값
  if (typeof window === 'undefined') {
    return {
      type: 'desktop',
      actualDeviceType: 'desktop',
      hasTouch: false,
      isWebView: false,
      screenWidth: 1920,
      isRealMobile: false,
      isDesktopSmallWindow: false,
      isMimotokApp: false,
    };
  }

  const screenWidth = window.innerWidth;
  const type = getDeviceType();
  const actualDeviceType = getActualDeviceType();
  const hasTouch = isTouchDevice();
  const isWebView = isAndroidWebView();
  const isMimotokAppEnv = isMimotokApp();

  // 실제 모바일 기기인지 (User-Agent 기반)
  const isRealMobile = actualDeviceType === 'mobile';

  // 데스크탑에서 브라우저 창만 작게 한 것인지
  // 조건: 화면 크기는 작지만, User-Agent는 데스크탑이고, 터치 미지원
  const isDesktopSmallWindow =
    type === 'mobile' &&
    actualDeviceType === 'desktop' &&
    !hasTouch;

  return {
    type,
    actualDeviceType,
    hasTouch,
    isWebView,
    screenWidth,
    isRealMobile,
    isDesktopSmallWindow,
    isMimotokApp: isMimotokAppEnv,
  };
}

/**
 * 디바이스 정보를 콘솔에 출력합니다. (디버깅용)
 *
 * @example
 * ```typescript
 * // 개발 중 디버깅
 * logDeviceInfo();
 * // Console output:
 * // [Device Info] {
 * //   type: 'mobile',
 * //   actualDeviceType: 'mobile',
 * //   hasTouch: true,
 * //   ...
 * // }
 * ```
 */
export function logDeviceInfo(): void {
  const info = getDeviceInfo();
  console.log('[Device Info]', {
    '화면 크기 기반 타입': info.type,
    '실제 디바이스 타입 (UA)': info.actualDeviceType,
    '화면 너비': `${info.screenWidth}px`,
    '터치 지원': info.hasTouch,
    'WebView 환경': info.isWebView,
    '실제 모바일 기기': info.isRealMobile,
    '데스크탑 창 축소': info.isDesktopSmallWindow,
    'Mimotok 앱': info.isMimotokApp,
    'User-Agent': getUserAgent(),
  });
}
