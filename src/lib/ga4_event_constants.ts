export const GA4_EVENTS = {
  LOGIN_CLICK: 'login_click',

  LANDING_AI_RECOMMENDATION_CLICK: 'landing_ai_recommendation',
  LANDING_VIDEO_CONSULT_CLICK: 'landing_video_consult',

  LANDING_GUIDE_CLICK: 'landing_guide_click',
  LANDING_HOSPITAL_SEARCH: 'landing_hospital_search',
  // 상담/예약
  CONSULT_CLICK: 'consult_click',
  RESERVE_CLICK: 'reserve_click',
  RESERVE_COMPLETE: 'reserve_complete',
  
  // 병원 관련
  HOSPITAL_VIEW: 'hospital_view',
  HOSPITAL_FAVORITE: 'hospital_favorite',
  
  // 외부 링크
  PHONE_CLICK: 'phone_click',
  INSTAGRAM_CLICK: 'instagram_click',
  WEBSITE_CLICK: 'website_click',
  
  // 검색/필터
  SEARCH_OPEN: 'search_open',
  SEARCH_EXECUTE: 'search_execute',
  FILTER_APPLY: 'filter_apply',
  
  // 리뷰
  REVIEW_WRITE: 'review_write',
  REVIEW_VIEW: 'review_view',

  
} as const;


export const GA4_PAGE_LOCATIONS = {
  HOSPITAL_DETAIL: 'hospital_detail',
  HOSPITAL_LIST: 'hospital_list',

  DIRECT_CHAT_MODAL: 'direct_chat_modal',
  PLATFORM_CHAT_CLICK: 'platform_chat_click',
  HOSPITAL_RESERVATION_PAGE_VIEW: 'reservation_page_view',
  HOSPITAL_VIDEO_CONSULT_CLICK: 'reservation_video_consult_click',


  SEARCH_RESULT: 'search_result',
  HOME: 'home',
} as const;


