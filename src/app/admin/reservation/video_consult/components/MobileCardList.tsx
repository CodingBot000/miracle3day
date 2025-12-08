'use client';

import React, { useState } from 'react';
import { User, Mail, Globe, Building2, ChevronDown, ChevronUp, Calendar, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  VideoReservationListItem,
  VideoReservationStatus,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/models/videoConsultReservation.dto';
import { formatDateTime } from '@/lib/admin/dateUtils';
import { AdminVideoConsultJoinButton } from '@/components/admin/video-consult/AdminVideoConsultJoinButton';

interface MobileCardListProps {
  reservations: VideoReservationListItem[];
  isSuperAdmin: boolean;
  onApprove: (res: VideoReservationListItem) => void;
  onChangeRequest: (res: VideoReservationListItem) => void;
  onReject: (res: VideoReservationListItem) => void;
  onComplete: (res: VideoReservationListItem) => void;
  onNoShow: (res: VideoReservationListItem) => void;
  onViewDetail: (res: VideoReservationListItem) => void;
}

export function MobileCardList({
  reservations,
  isSuperAdmin,
  onApprove,
  onChangeRequest,
  onReject,
  onComplete,
  onNoShow,
  onViewDetail,
}: MobileCardListProps) {
  const [expandedSlots, setExpandedSlots] = useState<Record<string, boolean>>({});

  const toggleSlots = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSlots((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const canApprove = (status: VideoReservationStatus) =>
    ['requested', 'needs_change', 'rescheduled'].includes(status);

  const canReject = (status: VideoReservationStatus) =>
    ['requested', 'needs_change', 'rescheduled'].includes(status);

  const canRequestChange = (status: VideoReservationStatus) =>
    ['requested', 'approved', 'rescheduled'].includes(status);

  const canMarkComplete = (status: VideoReservationStatus) => status === 'approved';

  const canMarkNoShow = (status: VideoReservationStatus) => status === 'approved';

  const getPatientName = (reservation: VideoReservationListItem) => {
    const firstName = reservation.private_first_name || '';
    const lastName = reservation.private_last_name || '';
    return `${firstName} ${lastName}`.trim() || '이름 없음';
  };

  return (
    <div className="space-y-4 p-4">
      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">예약이 없습니다.</p>
        </div>
      ) : (
        reservations.map((res) => (
          <div
            key={res.id_uuid}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewDetail(res)}
          >
            {/* 상태 + 요청일 */}
            <div className="flex justify-between items-start mb-3">
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[res.status]}`}
              >
                {STATUS_LABELS[res.status]}
              </span>
              <span className="text-xs text-gray-500">
                {formatDateTime(res.created_at)}
              </span>
            </div>

            {/* 환자 정보 */}
            <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm font-medium">{getPatientName(res)}</span>
              </div>
              {res.private_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{res.private_email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">{res.country || '-'}</span>
              </div>
              {isSuperAdmin && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    {res.id_uuid_hospital ? (res.hospital_name || '병원명 없음') : '랜딩 페이지'}
                  </span>
                </div>
              )}
            </div>

            {/* 희망 시간 */}
            <div className="mb-3">
              <button
                onClick={(e) => toggleSlots(res.id_uuid, e)}
                className="flex items-center justify-between w-full text-left py-2"
              >
                <span className="text-sm font-medium text-gray-700">요청 희망 시간</span>
                {res.requested_slots.length > 1 && (
                  expandedSlots[res.id_uuid] ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )
                )}
              </button>
              {expandedSlots[res.id_uuid] && res.requested_slots.length > 1 ? (
                <div className="space-y-2 mt-2">
                  {res.requested_slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 py-1">
                      <span
                        className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full ${
                          index === 0
                            ? 'bg-blue-500 text-white'
                            : index === 1
                            ? 'bg-green-500 text-white'
                            : 'bg-purple-500 text-white'
                        }`}
                      >
                        {slot.rank || index + 1}
                      </span>
                      <span className="text-sm text-gray-700">
                        {formatDateTime(slot.start)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </span>
                  <span className="text-sm text-gray-700">
                    {res.requested_slots[0]
                      ? formatDateTime(res.requested_slots[0].start)
                      : '-'}
                  </span>
                </div>
              )}
            </div>

            {/* 확정 일시 (승인된 경우) */}
            {res.confirmed_start_at && (
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div>
                  <span className="text-xs text-gray-500">확정 일시: </span>
                  <span className="text-sm font-medium text-green-600">
                    {formatDateTime(res.confirmed_start_at)}
                  </span>
                </div>
              </div>
            )}

            {/* 플랫폼 정보 */}
            {(res.zoom_meeting_id || res.meeting_room_id) && (
              <div className="mb-3 pb-3 border-b border-gray-100">
                {res.zoom_meeting_id && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                    Zoom
                  </span>
                )}
                {res.meeting_room_id && !res.zoom_meeting_id && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    Daily.co
                  </span>
                )}
              </div>
            )}

            {/* 화상상담 입장 버튼 (승인된 경우) */}
            {res.status === 'approved' && (res.zoom_join_url || res.meeting_room_id) && (
              <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                {res.zoom_join_url && (
                  <a
                    href={res.zoom_join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Zoom 입장
                  </a>
                )}
                {res.meeting_room_id && !res.zoom_meeting_id && (
                  <AdminVideoConsultJoinButton
                    meetingRoomId={res.meeting_room_id}
                    doctorDisplayName="Doctor"
                    disabled={!res.meeting_room_id}
                    disabledReason={
                      !res.meeting_room_id
                        ? '화상상담 방이 아직 생성되지 않았습니다'
                        : undefined
                    }
                    className="w-full text-sm"
                    openInNewTab={true}
                  />
                )}
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
              {canApprove(res.status) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                  onClick={() => onApprove(res)}
                >
                  요청 확인
                </Button>
              )}
              {canRequestChange(res.status) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-orange-600 border-orange-600 hover:bg-orange-50"
                  onClick={() => onChangeRequest(res)}
                >
                  변경요청
                </Button>
              )}
              {canReject(res.status) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => onReject(res)}
                >
                  거부
                </Button>
              )}
              {canMarkComplete(res.status) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => onComplete(res)}
                >
                  완료
                </Button>
              )}
              {canMarkNoShow(res.status) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-gray-600 border-gray-600 hover:bg-gray-50"
                  onClick={() => onNoShow(res)}
                >
                  노쇼
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
