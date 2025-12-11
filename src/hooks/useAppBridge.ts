'use client';

import { useEffect } from 'react';

/**
 * Android WebView와 통신하는 전역 훅
 * - app:updateLanguage 이벤트: 기기 언어 업데이트
 * - app:updateStartScreen 이벤트: 시작 화면 설정 업데이트
 */
export function useAppBridge() {
  useEffect(() => {
    // 언어 업데이트 이벤트 핸들러
    const handleLanguageUpdate = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { language } = customEvent.detail;

      console.log('[AppBridge] Language update event:', language);

      try {
        const response = await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: { language }
          })
        });

        if (response.ok) {
          console.log('[AppBridge] Language updated successfully:', language);
        } else {
          console.error('[AppBridge] Language update failed:', response.status);
        }
      } catch (error) {
        console.error('[AppBridge] Failed to update language:', error);
      }
    };

    // 시작 화면 업데이트 이벤트 핸들러
    const handleStartScreenUpdate = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { screen } = customEvent.detail;

      console.log('[AppBridge] Start screen update event:', screen);

      try {
        const response = await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: { app_start_screen: screen }
          })
        });

        if (response.ok) {
          console.log('[AppBridge] Start screen updated successfully:', screen);
        } else {
          console.error('[AppBridge] Start screen update failed:', response.status);
        }
      } catch (error) {
        console.error('[AppBridge] Failed to update start screen:', error);
      }
    };

    window.addEventListener('app:updateLanguage', handleLanguageUpdate);
    window.addEventListener('app:updateStartScreen', handleStartScreenUpdate);

    console.log('[AppBridge] Event listeners registered');

    return () => {
      window.removeEventListener('app:updateLanguage', handleLanguageUpdate);
      window.removeEventListener('app:updateStartScreen', handleStartScreenUpdate);
      console.log('[AppBridge] Event listeners removed');
    };
  }, []);
}
