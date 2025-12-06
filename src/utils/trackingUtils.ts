/**
 * 추적 관련 유틸리티 함수
 */

const SESSION_ID_KEY = 'tracking_session_id';

/**
 * 세션 ID 생성 (UUID v4 형식)
 */
function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 세션 ID 가져오기 또는 생성
 * sessionStorage에 저장하여 같은 탭 내에서 유지
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }

  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

/**
 * 현재 페이지 경로에 따른 source 감지
 */
export function detectPageSource(pathname: string): string {
  if (pathname.includes('/hospital/')) {
    return '병원_상세페이지';
  }
  if (pathname.includes('/search')) {
    return '검색결과';
  }
  if (pathname.includes('/treatment')) {
    return '시술_상세페이지';
  }
  if (pathname.includes('/community')) {
    return '커뮤니티';
  }
  return '기타';
}

/**
 * 디바이스 타입 감지
 */
export function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}
