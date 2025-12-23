import { event } from '@/lib/ga4';
import { GA4_EVENTS } from './ga4_event_constants';
import type { DeviceType } from '@/utils/deviceDetection';

interface LandingAIRecommendationParams {
  locale: string;
  device_type: DeviceType;
  referrer_url: string;
  page_path?: string;
}

export const GA4_EVENT_ACTION = {
  // 상담 클릭
  LANDING_AI_RECOMMENDATION_CLICK: (params: LandingAIRecommendationParams) => {
    event(GA4_EVENTS.LANDING_AI_RECOMMENDATION_CLICK, {
      locale: params.locale,
      device_type: params.device_type,
      referrer_url: params.referrer_url,
      page_path: params.page_path,
    });
  },
  LANDING_VIDEO_CONSULT: (params: LandingAIRecommendationParams) => {
    event(GA4_EVENTS.LANDING_VIDEO_CONSULT_CLICK, {
      locale: params.locale,
      device_type: params.device_type,
      referrer_url: params.referrer_url,
      page_path: params.page_path,
    });
  },
  HOSPITAL_LIST_PAGE: (params: LandingAIRecommendationParams) => {
    event(GA4_EVENTS.LANDING_HOSPITAL_SEARCH, {
      locale: params.locale,
      device_type: params.device_type,
      referrer_url: params.referrer_url,
      page_path: params.page_path,
    });
  },
  GLOBAL_SEARCH: (params: LandingAIRecommendationParams) => {
    event(GA4_EVENTS.LANDING_HOSPITAL_SEARCH, {
      locale: params.locale,
      device_type: params.device_type,
      referrer_url: params.referrer_url,
      page_path: params.page_path,
    });
  }
  
};