'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  VideoReservationListItem,
  VideoReservationListResponse,
  VideoReservationStatus,
  VideoReservationSortOption,
  STATUS_LABELS,
  STATUS_COLORS,
  SORT_LABELS,
} from '@/models/videoConsultReservation.dto';
import { formatDateTime, formatSlotDisplay } from '@/lib/admin/dateUtils';
import { ApproveReservationDialog } from './components/ApproveReservationDialog';
import { ChangeRequestDialog } from './components/ChangeRequestDialog';
import { RejectReservationDialog } from './components/RejectReservationDialog';
import { ConfirmActionDialog } from './components/ConfirmActionDialog';
import { ReservationDetailDrawer } from './components/ReservationDetailDrawer';
import { AdminVideoConsultJoinButton } from '@/components/admin/video-consult/AdminVideoConsultJoinButton';
import { PreferredTimesCell } from './components/PreferredTimesCell';
import { MobileCardList } from './components/MobileCardList';

interface VideoConsultReservationAdminPageProps {
  initialData: VideoReservationListResponse | null;
  isSuperAdmin: boolean;
}

const DEFAULT_STATUS_FILTER: VideoReservationStatus[] = [
  'requested',
  'needs_change',
  'approved',
];

const ALL_STATUSES: VideoReservationStatus[] = [
  'requested',
  'needs_change',
  'approved',
  'rescheduled',
  'completed',
  'no_show',
  'rejected',
];

export function VideoConsultReservationAdminPage({
  initialData,
  isSuperAdmin,
}: VideoConsultReservationAdminPageProps) {
  const [reservations, setReservations] = useState<VideoReservationListItem[]>(
    initialData?.items || []
  );
  const [totalCount, setTotalCount] = useState(initialData?.totalCount || 0);
  const [page, setPage] = useState(initialData?.page || 1);
  const [pageSize] = useState(initialData?.pageSize || 20);
  const [statusFilter, setStatusFilter] =
    useState<VideoReservationStatus[]>(DEFAULT_STATUS_FILTER);
  const [sort, setSort] = useState<VideoReservationSortOption>('status');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Dialog states
  const [selectedReservation, setSelectedReservation] =
    useState<VideoReservationListItem | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [changeRequestDialogOpen, setChangeRequestDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sort,
      });

      if (statusFilter.length > 0) {
        params.set('status', statusFilter.join(','));
      }

      const res = await fetch(`/api/admin/video-reservations?${params}`, {
        cache: 'no-store',
        credentials: 'include',
      });

      if (res.ok) {
        const data: VideoReservationListResponse = await res.json();
        setReservations(data.items);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sort, statusFilter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Media query for mobile detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleStatusFilterChange = (status: VideoReservationStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
    setPage(1);
  };

  const handleResetFilters = () => {
    setStatusFilter(DEFAULT_STATUS_FILTER);
    setSort('status');
    setPage(1);
  };

  const handleActionSuccess = () => {
    fetchReservations();
    setSelectedReservation(null);
  };

  const openApproveDialog = (reservation: VideoReservationListItem) => {
    setSelectedReservation(reservation);
    setApproveDialogOpen(true);
  };

  const openChangeRequestDialog = (reservation: VideoReservationListItem) => {
    setSelectedReservation(reservation);
    setChangeRequestDialogOpen(true);
  };

  const openRejectDialog = (reservation: VideoReservationListItem) => {
    setSelectedReservation(reservation);
    setRejectDialogOpen(true);
  };

  const openCompleteDialog = (reservation: VideoReservationListItem) => {
    setSelectedReservation(reservation);
    setCompleteDialogOpen(true);
  };

  const openNoShowDialog = (reservation: VideoReservationListItem) => {
    setSelectedReservation(reservation);
    setNoShowDialogOpen(true);
  };

  const openDetailDrawer = (reservation: VideoReservationListItem) => {
    setSelectedReservation(reservation);
    setDetailDrawerOpen(true);
  };

  const handleUndoApproval = async (reservationId: string) => {
    const confirmed = window.confirm(
      '승인을 취소하시겠습니까?\n\n' +
      '확정된 시간과 화상 미팅이 삭제되고,\n' +
      '승인 전 상태로 되돌아갑니다.'
    );

    if (!confirmed) return;

    const reservation = reservations.find((r) => r.id_uuid === reservationId);
    if (!reservation) return;

    const isZoom = !!reservation.zoom_meeting_id;
    const apiUrl = isZoom
      ? `/api/admin/video-reservations-zoom/${reservationId}`
      : `/api/admin/video-reservations/${reservationId}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'undo_approval' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '승인 취소 실패');
      }

      const result = await response.json();

      // 리스트 즉시 업데이트
      setReservations((prev) =>
        prev.map((res) =>
          res.id_uuid === reservationId
            ? {
                ...res,
                status: result.previousStatus,
                confirmed_start_at: null,
                confirmed_end_at: null,
                consultation_duration_minutes: null,
                zoom_meeting_id: null,
                zoom_join_url: null,
                zoom_meeting_password: null,
                meeting_room_id: null,
                meeting_provider: null,
                status_changed_at: new Date().toISOString(),
              }
            : res
        )
      );

      alert(
        `승인이 취소되었습니다.\n` +
        `상태: ${result.previousStatus === 'needs_change' ? '변경 요청' : '요청됨'}`
      );
    } catch (error: any) {
      console.error(error);
      alert(`승인 취소 실패: ${error.message}`);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const canApprove = (status: VideoReservationStatus) =>
    ['requested', 'needs_change', 'rescheduled'].includes(status);

  const canReject = (status: VideoReservationStatus) =>
    ['requested', 'needs_change', 'rescheduled'].includes(status);

  const canRequestChange = (status: VideoReservationStatus) =>
    ['requested', 'approved', 'rescheduled'].includes(status);

  const canMarkComplete = (status: VideoReservationStatus) =>
    status === 'approved';

  const canMarkNoShow = (status: VideoReservationStatus) =>
    status === 'approved';

  const getPatientName = (reservation: VideoReservationListItem) => {
    const firstName = reservation.private_first_name || '';
    const lastName = reservation.private_last_name || '';
    return `${firstName} ${lastName}`.trim() || '이름 없음';
  };

  const getPreferredDateLabel = (reservation: VideoReservationListItem) => {
    if (reservation.earliest_requested_start) {
      return formatDateTime(reservation.earliest_requested_start);
    }
    if (reservation.requested_slots && reservation.requested_slots.length > 0) {
      return formatDateTime(reservation.requested_slots[0].start);
    }
    return '-';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">영상상담 예약 관리</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">상태:</span>
            {ALL_STATUSES.map((status) => (
              <label
                key={status}
                className="flex items-center gap-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={statusFilter.includes(status)}
                  onChange={() => handleStatusFilterChange(status)}
                  className="rounded border-gray-300"
                />
                <span
                  className={`px-2 py-0.5 text-xs rounded ${STATUS_COLORS[status]}`}
                >
                  {STATUS_LABELS[status]}
                </span>
              </label>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">정렬:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as VideoReservationSortOption);
                setPage(1);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              {(
                Object.keys(SORT_LABELS) as VideoReservationSortOption[]
              ).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          {/* Reset */}
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            필터 초기화
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : isMobile ? (
        /* Mobile Card List */
        <MobileCardList
          reservations={reservations}
          isSuperAdmin={isSuperAdmin}
          onApprove={openApproveDialog}
          onChangeRequest={openChangeRequestDialog}
          onReject={openRejectDialog}
          onComplete={openCompleteDialog}
          onNoShow={openNoShowDialog}
          onViewDetail={openDetailDrawer}
          onUndoApproval={handleUndoApproval}
        />
      ) : (
        /* Desktop Table */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">예약이 없습니다.</p>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청일
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      환자 이름
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      국적
                    </th>
                    {isSuperAdmin && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        병원
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      희망 일시 (KST)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      확정 일시
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      플랫폼
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      화상상담
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr
                      key={reservation.id_uuid}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openDetailDrawer(reservation)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            STATUS_COLORS[reservation.status]
                          }`}
                        >
                          {STATUS_LABELS[reservation.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(reservation.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getPatientName(reservation)}
                        </div>
                        {reservation.private_email && (
                          <div className="text-xs text-gray-500">
                            {reservation.private_email}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.country || '-'}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reservation.id_uuid_hospital
                            ? (reservation.hospital_name || '병원명 없음')
                            : <span className="text-gray-500 italic">랜딩 페이지</span>
                          }
                        </td>
                      )}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <PreferredTimesCell
                          slots={reservation.requested_slots}
                          earliestStart={reservation.earliest_requested_start}
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.confirmed_start_at
                          ? formatDateTime(reservation.confirmed_start_at)
                          : '-'}
                      </td>
                      {/* 플랫폼 배지 */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {reservation.zoom_meeting_id && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                            Zoom
                          </span>
                        )}
                        {reservation.meeting_room_id && !reservation.zoom_meeting_id && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            Daily.co
                          </span>
                        )}
                        {!reservation.zoom_meeting_id && !reservation.meeting_room_id && (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      {/* 화상상담 입장 버튼 */}
                      <td
                        className="px-4 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {reservation.status === 'approved' && (
                          <div className="flex gap-1">
                            {/* Zoom 링크 */}
                            {reservation.zoom_join_url && (
                              <a
                                href={reservation.zoom_join_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                Zoom 입장
                              </a>
                            )}
                            {/* Daily.co 링크 */}
                            {reservation.meeting_room_id && !reservation.zoom_meeting_id && (
                              <AdminVideoConsultJoinButton
                                meetingRoomId={reservation.meeting_room_id}
                                doctorDisplayName="Doctor"
                                disabled={!reservation.meeting_room_id}
                                disabledReason={
                                  !reservation.meeting_room_id
                                    ? '화상상담 방이 아직 생성되지 않았습니다'
                                    : undefined
                                }
                                className="text-xs px-2 py-1"
                                openInNewTab={true}
                              />
                            )}
                            {/* 둘 다 없을 경우 */}
                            {!reservation.zoom_join_url && !reservation.meeting_room_id && (
                              <span className="text-xs text-gray-400">준비중</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td
                        className="px-4 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-1">
                          {canApprove(reservation.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              onClick={() => openApproveDialog(reservation)}
                            >
                              요청 확인
                            </Button>
                          )}
                          {canRequestChange(reservation.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 border-orange-600 hover:bg-orange-50"
                              onClick={() =>
                                openChangeRequestDialog(reservation)
                              }
                            >
                              변경요청
                            </Button>
                          )}
                          {canReject(reservation.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => openRejectDialog(reservation)}
                            >
                              거부
                            </Button>
                          )}
                          {reservation.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50 font-semibold"
                              onClick={() => handleUndoApproval(reservation.id_uuid)}
                            >
                              승인 취소
                            </Button>
                          )}
                          {canMarkComplete(reservation.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => openCompleteDialog(reservation)}
                            >
                              완료
                            </Button>
                          )}
                          {canMarkNoShow(reservation.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-gray-600 border-gray-600 hover:bg-gray-50"
                              onClick={() => openNoShowDialog(reservation)}
                            >
                              노쇼
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                총 {totalCount}건 중 {(page - 1) * pageSize + 1} -{' '}
                {Math.min(page * pageSize, totalCount)}건
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  이전
                </Button>
                <span className="px-3 py-1 text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  다음
                </Button>
              </div>
            </div>
          </>
          )}
        </div>
      )}

      {/* Dialogs */}
      {selectedReservation && (
        <>
          <ApproveReservationDialog
            open={approveDialogOpen}
            onOpenChange={setApproveDialogOpen}
            reservation={selectedReservation}
            onSuccess={handleActionSuccess}
          />
          <ChangeRequestDialog
            open={changeRequestDialogOpen}
            onOpenChange={setChangeRequestDialogOpen}
            reservation={selectedReservation}
            onSuccess={handleActionSuccess}
          />
          <RejectReservationDialog
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            reservation={selectedReservation}
            onSuccess={handleActionSuccess}
          />
          <ConfirmActionDialog
            open={completeDialogOpen}
            onOpenChange={setCompleteDialogOpen}
            reservation={selectedReservation}
            action="mark_completed"
            title="상담 완료 처리"
            description="이 예약을 완료 처리하시겠습니까?"
            onSuccess={handleActionSuccess}
          />
          <ConfirmActionDialog
            open={noShowDialogOpen}
            onOpenChange={setNoShowDialogOpen}
            reservation={selectedReservation}
            action="mark_no_show"
            title="노쇼 처리"
            description="이 예약을 노쇼 처리하시겠습니까?"
            onSuccess={handleActionSuccess}
          />
          <ReservationDetailDrawer
            open={detailDrawerOpen}
            onOpenChange={setDetailDrawerOpen}
            reservation={selectedReservation}
          />
        </>
      )}
    </div>
  );
}
