'use client';

import { useCallback, useRef } from 'react';
import { trackingService, HospitalTouchpointPayload } from '@/services/trackingService';
import {
  getOrCreateSessionId,
  detectPageSource,
  detectDeviceType,
} from '@/utils/trackingUtils';

interface UseHospitalTouchpointTrackingOptions {
  memberId?: string | null;
}

/**
 * 병원 터치포인트 추적을 위한 커스텀 훅
 * @param hospitalId 병원 UUID
 * @param source 페이지 소스 (자동 감지 가능)
 * @param options 옵션 (memberId 등)
 */
export function useHospitalTouchpointTracking(
  hospitalId: string,
  source?: string,
  options?: UseHospitalTouchpointTrackingOptions
) {
  const sessionIdRef = useRef<string | null>(null);

  /**
   * 이벤트 추적
   * @param eventType 이벤트 타입 (예: 'external_link_click', 'booking_started')
   * @param eventData 이벤트 데이터
   */
  const trackEvent = useCallback(
    async (eventType: string, eventData: Record<string, any>): Promise<void> => {
      // 세션 ID 가져오기 (한 번만 생성)
      if (!sessionIdRef.current) {
        sessionIdRef.current = getOrCreateSessionId();
      }

      // 자동 수집 데이터
      const autoCollectedData = {
        device_type: detectDeviceType(),
      };

      // 페이지 소스 자동 감지
      const pageSource =
        source || (typeof window !== 'undefined' ? detectPageSource(window.location.pathname) : '기타');

      const payload: HospitalTouchpointPayload = {
        id_uuid_hospital: hospitalId,
        id_uuid_member: options?.memberId || null,
        event_type: eventType,
        event_data: {
          ...autoCollectedData,
          ...eventData,
        },
        source: pageSource,
        session_id: sessionIdRef.current,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        referrer_url: typeof document !== 'undefined' ? document.referrer : undefined,
      };

      // API 호출 (에러가 발생해도 사용자 경험에 영향 없음)
      await trackingService.trackHospitalTouchpoint(payload);
    },
    [hospitalId, source, options?.memberId]
  );

  return { trackEvent };
}
