// ============================================
// 일반 예약 상태 (숫자 기반)
// ============================================
export const RESERVATION_STATUS = {
  PENDING: 0,
  APPROVE: 1,
  CANCEL: 2,
  COMPLETE: 3,
} as const;

// ============================================
// 화상상담 예약 상태 (문자열 기반)
// ============================================
export type VideoReservationStatus =
  | "requested"     // 고객이 요청한 초기 상태
  | "approved"      // 병원이 승인하여 확정
  | "rejected"      // 병원이 거부
  | "needs_change"  // 병원이 날짜/시간 변경 제안
  | "rescheduled"   // 고객이 재제출한 상태
  | "completed"     // 상담 완료
  | "no_show";      // 노쇼

export const VIDEO_RESERVATION_STATUS = {
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
  NEEDS_CHANGE: "needs_change",
  RESCHEDULED: "rescheduled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
} as const;
