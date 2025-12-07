/**
 * Daily.co Video Consultation URL Builder
 *
 * 이 유틸리티는 Daily.co 화상상담 페이지로 이동하기 위한 URL을 생성합니다.
 * Admin(병원)과 사용자(환자) 양쪽에서 공통으로 사용할 수 있습니다.
 *
 * 실제 Daily.co room URL (https://...daily.co/...) 은
 * /mobile/consult-daily/[reservationId] 페이지 내부에서 API를 통해 생성됩니다.
 */

export type DailyUserRole = 'doctor' | 'patient';

interface BuildDailyConsultUrlParams {
  /**
   * 예약 ID (consult_video_reservations.meeting_room_id)
   * Daily Room 이름은 bl-{reservationId} 형식으로 생성됨
   */
  reservationId: string;

  /**
   * 사용자 역할
   * - doctor: 의사/병원 관리자 (모더레이터 권한)
   * - patient: 환자 (일반 참가자)
   */
  role: DailyUserRole;

  /**
   * 화상상담에 표시될 이름 (선택)
   */
  name?: string | null;
}

/**
 * Daily.co 화상상담 페이지 URL을 생성합니다.
 *
 * @example
 * ```typescript
 * const url = buildDailyConsultUrl({
 *   reservationId: 'vc_abc123',
 *   role: 'doctor',
 *   name: 'Dr. Kim',
 * });
 * // 결과: '/mobile/consult-daily/vc_abc123?role=doctor&name=Dr.%20Kim'
 * ```
 */
export function buildDailyConsultUrl({
  reservationId,
  role,
  name,
}: BuildDailyConsultUrlParams): string {
  const basePath = '/mobile/consult-daily';

  const searchParams = new URLSearchParams();
  searchParams.set('role', role);

  if (name) {
    searchParams.set('name', name);
  }

  return `${basePath}/${reservationId}?${searchParams.toString()}`;
}

/**
 * meeting_room_id가 유효한지 검사합니다.
 */
export function isValidMeetingRoomId(
  meetingRoomId: string | null | undefined
): meetingRoomId is string {
  return typeof meetingRoomId === 'string' && meetingRoomId.trim().length > 0;
}
