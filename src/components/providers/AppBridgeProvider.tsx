'use client';

import { useAppBridge } from '@/hooks/useAppBridge';

/**
 * Android WebView 앱 브리지 이벤트 리스너를 등록하는 Provider
 * layout.tsx에서 사용하여 전역으로 이벤트를 처리합니다.
 */
export function AppBridgeProvider({ children }: { children: React.ReactNode }) {
  useAppBridge();
  return <>{children}</>;
}
