'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  VideoReservationListItem,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/models/videoConsultReservation.dto';
import { formatDateTime, formatSlotDisplay } from '@/lib/admin/dateUtils';
import { AdminVideoConsultJoinButton } from '@/components/admin/video-consult/AdminVideoConsultJoinButton';

interface ReservationDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: VideoReservationListItem;
}

export function ReservationDetailDrawer({
  open,
  onOpenChange,
  reservation,
}: ReservationDetailDrawerProps) {
  const getPatientName = () => {
    const firstName = reservation.private_first_name || '';
    const lastName = reservation.private_last_name || '';
    return `${firstName} ${lastName}`.trim() || '이름 없음';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>예약 상세 정보</DialogTitle>
          <DialogDescription>
            예약 ID: {reservation.id_uuid.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">상태</h3>
            <span
              className={`px-3 py-1 text-sm font-medium rounded ${
                STATUS_COLORS[reservation.status]
              }`}
            >
              {STATUS_LABELS[reservation.status]}
            </span>
            {reservation.status_changed_at && (
              <span className="ml-2 text-xs text-gray-500">
                (변경일: {formatDateTime(reservation.status_changed_at)})
              </span>
            )}
          </div>

          {/* Patient Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">환자 정보</h3>
            <div className="bg-gray-50 rounded p-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">이름</span>
                <span className="text-sm font-medium">{getPatientName()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">이메일</span>
                <span className="text-sm">{reservation.private_email || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">성별</span>
                <span className="text-sm">{reservation.private_gender || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">연령대</span>
                <span className="text-sm">{reservation.private_age_range || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">국적</span>
                <span className="text-sm">{reservation.country || '-'}</span>
              </div>
            </div>
          </div>

          {/* Requested Slots */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              고객 희망 시간 (타임존: {reservation.user_timezone})
            </h3>
            <div className="space-y-2">
              {reservation.requested_slots.map((slot, index) => {
                const display = formatSlotDisplay(
                  slot,
                  reservation.user_timezone
                );
                return (
                  <div key={index} className="bg-gray-50 rounded p-2">
                    <div className="text-sm font-medium">
                      {index + 1}순위: {display.kstTime}
                    </div>
                    <div className="text-xs text-gray-500">
                      고객 시간: {display.userTime}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hospital Proposed Slots */}
          {reservation.hospital_proposed_slots &&
            reservation.hospital_proposed_slots.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  병원 제안 시간
                </h3>
                <div className="space-y-2">
                  {reservation.hospital_proposed_slots.map((slot, index) => {
                    const display = formatSlotDisplay(
                      slot,
                      reservation.user_timezone
                    );
                    return (
                      <div
                        key={index}
                        className="bg-orange-50 rounded p-2 border border-orange-200"
                      >
                        <div className="text-sm font-medium">
                          {index + 1}순위: {display.kstTime}
                        </div>
                        <div className="text-xs text-gray-500">
                          고객 시간: {display.userTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Confirmed Time */}
          {reservation.confirmed_start_at && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                확정된 상담 시간
              </h3>
              <div className="bg-blue-50 rounded p-3 border border-blue-200">
                <div className="text-sm font-medium">
                  {formatDateTime(reservation.confirmed_start_at)} ~{' '}
                  {reservation.confirmed_end_at &&
                    formatDateTime(reservation.confirmed_end_at)}
                </div>
                {reservation.consultation_duration_minutes && (
                  <div className="text-xs text-gray-500">
                    상담 시간: {reservation.consultation_duration_minutes}분
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Video Consultation Join Button */}
          {reservation.status === 'approved' && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                화상 상담
              </h3>
              <AdminVideoConsultJoinButton
                meetingRoomId={reservation.meeting_room_id}
                doctorDisplayName="Doctor"
                disabled={!reservation.meeting_room_id}
                disabledReason={
                  !reservation.meeting_room_id
                    ? '화상상담 방이 아직 생성되지 않았습니다'
                    : undefined
                }
                openInNewTab={true}
              />
              {!reservation.meeting_room_id && (
                <p className="text-xs text-gray-500 mt-2">
                  고객이 화상상담을 시작하면 방 ID가 생성됩니다.
                </p>
              )}
            </div>
          )}

          {/* Cancel Reason */}
          {reservation.status === 'rejected' && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                거부 사유
              </h3>
              <div className="bg-red-50 rounded p-3 border border-red-200">
                {reservation.cancel_reason_code && (
                  <div className="text-sm font-medium">
                    사유 코드: {reservation.cancel_reason_code}
                  </div>
                )}
                {reservation.cancel_reason_text && (
                  <div className="text-sm text-gray-700 mt-1">
                    {reservation.cancel_reason_text}
                  </div>
                )}
                {!reservation.cancel_reason_code &&
                  !reservation.cancel_reason_text && (
                    <div className="text-sm text-gray-500">
                      사유가 입력되지 않았습니다.
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Notes */}
          {(reservation.hospital_notes || reservation.user_notes) && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">메모</h3>
              <div className="space-y-2">
                {reservation.hospital_notes && (
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500">병원 메모</div>
                    <div className="text-sm">{reservation.hospital_notes}</div>
                  </div>
                )}
                {reservation.user_notes && (
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500">고객 메모</div>
                    <div className="text-sm">{reservation.user_notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">일시 정보</h3>
            <div className="bg-gray-50 rounded p-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>요청일</span>
                <span>{formatDateTime(reservation.created_at)}</span>
              </div>
              {reservation.updated_at && (
                <div className="flex justify-between">
                  <span>최종 수정일</span>
                  <span>{formatDateTime(reservation.updated_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
