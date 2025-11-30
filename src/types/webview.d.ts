/**
 * WebView Bridge 타입 정의
 * Android WebView에서 제공하는 네이티브 함수 인터페이스
 */

interface AndroidBridge {
  /**
   * Toast 메시지 표시
   */
  showToast(message: string): void;

  /**
   * 네이티브 카메라 열기
   */
  openCamera(): void;

  /**
   * 네이티브 갤러리 열기
   */
  openGallery(): void;

  /**
   * 앱 설정 열기
   */
  openSettings(): void;

  /**
   * 네이티브 공유 다이얼로그 열기
   */
  share(data: { title?: string; text?: string; url?: string }): void;

  /**
   * 뒤로가기 처리
   */
  goBack(): void;

  /**
   * 앱 종료
   */
  exitApp(): void;

  /**
   * 로컬 스토리지 저장 (네이티브)
   */
  saveToNativeStorage(key: string, value: string): void;

  /**
   * 로컬 스토리지 읽기 (네이티브)
   */
  getFromNativeStorage(key: string): string | null;

  /**
   * 푸시 알림 권한 요청
   */
  requestNotificationPermission(): void;

  /**
   * 위치 권한 요청
   */
  requestLocationPermission(): void;

  /**
   * FCM 토큰 가져오기
   */
  getFCMToken(): string | null;

  /**
   * 네이티브 로딩 표시
   */
  showLoading(message?: string): void;

  /**
   * 네이티브 로딩 숨기기
   */
  hideLoading(): void;

  /**
   * 커스텀 이벤트 전송
   */
  sendEvent(eventName: string, data?: any): void;

  /**
   * Chrome Custom Tabs로 Google 로그인 열기
   * WebView에서 Google OAuth가 차단되므로 Chrome Custom Tabs 사용
   */
  openGoogleLogin(url: string): void;

  /**
   * Chrome Custom Tabs로 외부 URL 열기 (범용)
   */
  openInCustomTab(url: string): void;
}

interface Window {
  /**
   * Android WebView Bridge
   */
  AndroidBridge?: AndroidBridge;

  /**
   * iOS WebKit 메시지 핸들러 (추후 구현)
   */
  webkit?: {
    messageHandlers?: {
      [key: string]: {
        postMessage: (data: any) => void;
      };
    };
  };
}
