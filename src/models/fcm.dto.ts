// ===========================
// 요청 DTO
// ===========================

export interface RegisterFcmTokenDto {
  fcmToken: string;
  deviceId: string;
  platform: 'android' | 'ios';
  preferredLanguage: string;
}

export interface ConnectMemberDto {
  fcmToken: string;
  idUuidMember: string;
}

export interface DisconnectMemberDto {
  fcmToken: string;
}

export interface UpdateLanguageDto {
  fcmToken: string;
  preferredLanguage: string;
}

export interface UpdatePreferencesDto {
  fcmToken: string;
  allowGeneral: boolean;
  allowActivity: boolean;
  allowMarketing: boolean;
}

// ===========================
// 응답 DTO
// ===========================

export interface FcmResponseDto {
  success: boolean;
  message: string;
}

export interface FcmErrorDto {
  error: string;
  details?: any;
}

// ===========================
// 푸시 발송 DTO
// ===========================

export type PushType =
  // 트랜잭션
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_reminder'
  | 'consultation_ready'
  | 'consultation_started'
  | 'payment_completed'
  | 'payment_refunded'
  // 일반
  | 'system_announcement'
  | 'service_maintenance'
  | 'terms_updated'
  | 'review_approved'
  | 'review_rejected'
  // 활동
  | 'review_comment'
  | 'review_like'
  | 'community_comment'
  | 'community_reply'
  | 'community_like'
  // 마케팅
  | 'promotion_event'
  | 'promotion_discount'
  | 'promotion_coupon'
  | 'new_hospital'
  | 'new_treatment';

export interface PushMessageDto {
  title: string;
  body: string;
  data?: Record<string, string>;
  pushType: PushType;
}

export interface SendPushDto {
  memberId: string;
  pushType: PushType;
  title: Record<string, string>; // { en: '...', ko: '...', ... }
  body: Record<string, string>;
  data?: Record<string, string>;
}

// ===========================
// DB 모델
// ===========================

export interface FcmTokenModel {
  id: number;
  id_uuid_member: string | null;
  fcm_token: string;
  device_id: string;
  platform: string;
  preferred_language: string;
  allow_general: boolean;
  allow_activity: boolean;
  allow_marketing: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_active_at: Date;
}

export interface PushHistoryModel {
  id: number;
  push_type: string;
  target_type: 'individual' | 'group' | 'broadcast';
  target_member_id: string | null;
  target_filter: any;
  message_data: any;
  sent_count: number;
  success_count: number | null;
  failed_count: number | null;
  metadata: any;
  status: 'pending' | 'sending' | 'completed' | 'failed';
  created_at: Date;
  completed_at: Date | null;
}
