// Video consultation reservation DTOs and types

export type VideoConsultTimeSlot = {
  rank: number;
  start: string;          // ISO string (UTC)
  end?: string;           // ISO string (UTC) - optional, can be calculated from duration
  sourceTimezone: string; // e.g. "America/Los_Angeles" or "Asia/Seoul"
};

export type VideoReservationStatus =
  | "requested"     // 고객이 요청한 초기 상태
  | "approved"      // 병원이 승인하여 확정
  | "rejected"      // 병원이 거부
  | "needs_change"  // 병원이 날짜/시간 변경 제안
  | "rescheduled"   // 고객이 재제출한 상태
  | "completed"     // 상담 완료
  | "no_show"       // 노쇼
  | "cancelled";    // 취소됨 (patient or hospital)

export const VIDEO_RESERVATION_STATUS = {
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
  NEEDS_CHANGE: "needs_change",
  RESCHEDULED: "rescheduled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
} as const;


// Status priority for sorting
export const STATUS_PRIORITY: VideoReservationStatus[] = [
  "requested",
  "needs_change",
  "approved",
  "rescheduled",
  "completed",
  "no_show",
  "rejected",
];

export interface VideoReservationListItem {
  id_uuid: string;

  created_at: string;
  updated_at: string | null;

  status: VideoReservationStatus;
  status_changed_at: string | null;

  // 고객이 요청한 슬롯들
  requested_slots: VideoConsultTimeSlot[];
  user_timezone: string;

  // 병원이 제안한 슬롯들 (없을 수 있음)
  hospital_proposed_slots?: VideoConsultTimeSlot[] | null;

  // 최종 확정된 시간
  confirmed_start_at?: string | null;
  confirmed_end_at?: string | null;
  consultation_duration_minutes: number | null;

  // 조인된 consultation_submissions 정보
  submission_id: string;
  private_first_name: string | null;
  private_last_name: string | null;
  private_email: string | null;
  private_gender: string | null;
  private_age_range: string | null;
  country: string | null;

  // 병원/멤버 관련
  id_uuid_hospital: string | null;
  id_uuid_member: string | null;
  hospital_name?: string | null;      // SUPER_ADMIN일 때만 조회
  hospital_name_en?: string | null;   // SUPER_ADMIN일 때만 조회

  // 기타
  cancel_reason_code?: string | null;
  cancel_reason_text?: string | null;

  // Notes
  hospital_notes?: string | null;
  user_notes?: string | null;

  // Daily.co 화상상담 관련
  meeting_room_id?: string | null;

  // Zoom 화상상담 관련
  zoom_meeting_id?: string | null;
  zoom_join_url?: string | null;
  zoom_meeting_password?: string | null;

  // 파생필드 (프론트 계산용)
  earliest_requested_start?: string | null;
  preferred_date_label?: string;
}

export interface VideoReservationListResponse {
  items: VideoReservationListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
}

// PATCH request body types
export type VideoReservationPatchBody =
  | {
      action: "approve";
      confirmedStart: string; // ISO string (UTC)
      confirmedEnd: string;   // ISO string (UTC)
      consultationDurationMinutes?: number;
    }
  | {
      action: "reject";
      cancelReasonCode?: string;
      cancelReasonText?: string;
    }
  | {
      action: "request_change";
      hospitalProposedSlots: VideoConsultTimeSlot[];
    }
  | {
      action: "mark_completed";
    }
  | {
      action: "mark_no_show";
    }
  | {
      action: "undo_approval";
    };

// Status display labels (Korean)
export const STATUS_LABELS: Record<VideoReservationStatus, string> = {
  requested: "요청됨",
  approved: "승인됨",
  rejected: "거부됨",
  needs_change: "변경 요청",
  rescheduled: "재제출됨",
  completed: "완료",
  no_show: "노쇼",
  cancelled: "취소됨",
};

// Status badge colors
export const STATUS_COLORS: Record<VideoReservationStatus, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  needs_change: "bg-orange-100 text-orange-800",
  rescheduled: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  no_show: "bg-gray-100 text-gray-800",
  cancelled: "bg-gray-200 text-gray-700",
};

// Sort options
export type VideoReservationSortOption =
  | "status"
  | "created_at_desc"
  | "created_at_asc"
  | "preferred_date_asc";

export const SORT_LABELS: Record<VideoReservationSortOption, string> = {
  status: "상태 우선순위",
  created_at_desc: "요청일 (최신순)",
  created_at_asc: "요청일 (오래된순)",
  preferred_date_asc: "희망일 (빠른순)",
};
