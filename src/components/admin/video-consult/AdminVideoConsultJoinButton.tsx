'use client';

import { useRouter } from 'next/navigation';
import { buildDailyConsultUrl, isValidMeetingRoomId } from '@/lib/admin/dailyUrl';
import { cn } from '@/lib/utils';

type Props = {
  /**
   * consult_video_reservations.meeting_room_id
   * null/undefined/빈문자열인 경우 버튼이 비활성화됩니다.
   */
  meetingRoomId: string | null | undefined;

  /**
   * 화상상담에 표시될 의사/병원 이름
   * 없으면 'Doctor'로 표시됩니다.
   */
  doctorDisplayName?: string | null;

  /**
   * 버튼 비활성화 여부 (예: 예약 시간 전)
   */
  disabled?: boolean;

  /**
   * 비활성화 사유 툴팁 메시지
   */
  disabledReason?: string;

  /**
   * 추가 CSS 클래스
   */
  className?: string;

  /**
   * 새 탭에서 열지 여부 (기본: false - 현재 탭에서 이동)
   */
  openInNewTab?: boolean;
};

/**
 * 어드민(병원) 화면에서 Daily.co 화상상담에 입장하는 버튼
 *
 * - meeting_room_id를 기반으로 /mobile/consult-daily/{id}?role=doctor 로 이동
 * - meeting_room_id가 없거나 disabled인 경우 버튼 비활성화
 */
export function AdminVideoConsultJoinButton({
  meetingRoomId,
  doctorDisplayName,
  disabled,
  disabledReason,
  className,
  openInNewTab = false,
}: Props) {
  const router = useRouter();

  const isDisabled = disabled || !isValidMeetingRoomId(meetingRoomId);

  const handleClick = () => {
    if (!meetingRoomId || isDisabled) return;

    const url = buildDailyConsultUrl({
      reservationId: meetingRoomId,
      role: 'doctor',
      name: doctorDisplayName || 'Doctor',
    });

    if (openInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      router.push(url);
    }
  };

  const buttonTitle = isDisabled
    ? disabledReason || '화상상담 방이 아직 생성되지 않았습니다'
    : '화상상담 방에 입장합니다';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      title={buttonTitle}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
        isDisabled
          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        className
      )}
    >
      <VideoIcon />
      <span>실시간 화상 상담 입장</span>
    </button>
  );
}

function VideoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}
