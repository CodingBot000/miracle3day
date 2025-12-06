/**
 * 추적 서비스 - API 호출 로직 추상화
 */

export interface HospitalTouchpointPayload {
  id_uuid_hospital: string;
  id_uuid_member?: string | null;
  event_type: string;
  event_data: Record<string, any>;
  source?: string;
  session_id?: string;
  user_agent?: string;
  referrer_url?: string;
}

export interface TrackingResponse {
  success: boolean;
  message: string;
  eventId?: string;
}

export const trackingService = {
  /**
   * 병원 터치포인트 이벤트 추적
   * 실패해도 사용자 경험에 영향을 주지 않도록 에러는 콘솔에만 로깅
   */
  async trackHospitalTouchpoint(payload: HospitalTouchpointPayload): Promise<TrackingResponse | null> {
    try {
      const response = await fetch('/api/tracking/external-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('Tracking API error:', response.status, response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Tracking request failed:', error);
      return null;
    }
  },
};
