'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReservationInputDto, ReservationOutputDto } from '@/models/admin/reservation.dto';
import { RESERVATION_STATUS } from '@/constants/reservation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ReservationClientProps {
  initialReservationData: ReservationOutputDto | null;
  hospitalId: string;
}

export default function ReservationClient({ initialReservationData, hospitalId }: ReservationClientProps) {
  const [reservations, setReservations] = useState<ReservationInputDto[]>(
    initialReservationData?.data || []
  );

  const getStatusColor = (status?: number) => {
    switch (status) {
      case RESERVATION_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case RESERVATION_STATUS.APPROVE:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case RESERVATION_STATUS.CANCEL:
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case RESERVATION_STATUS.COMPLETE:
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusCodeToText = (status_code?: number) => {
    switch (status_code) {
      case RESERVATION_STATUS.PENDING:
        return '대기중';
      case RESERVATION_STATUS.APPROVE:
        return '승인';
      case RESERVATION_STATUS.CANCEL:
        return '취소';
      case RESERVATION_STATUS.COMPLETE:
        return '완료';
      default:
        return status_code || '대기중';
    }
  };

  const handleStatusChange = async (reservationId: string | undefined, newStatus: string) => {
    if (!reservationId) return;
    
    // TODO: API call to update status
    console.log('Updating status for reservation:', reservationId, 'to:', newStatus);
    
    // Update local state
    setReservations(prev =>
      prev.map(reservation =>
        reservation.id_uuid === reservationId
          ? { ...reservation, status: newStatus }
          : reservation
      )
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
    } catch {
      return dateString;
    }
  };

  if (!reservations.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">예약이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  희망 날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  희망 시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  인원
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation, index) => (
                <tr key={reservation.id_uuid || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reservation.name}
                    </div>
                    {reservation.english_name && (
                      <div className="text-xs text-gray-500">{reservation.english_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservation.phone}</div>
                    {reservation.email && (
                      <div className="text-xs text-gray-500">{reservation.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(reservation.preferred_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reservation.preferred_time || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reservation.visitor_count || reservation.reservation_headcount || 1}명
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reservation.status_code === RESERVATION_STATUS.PENDING || !reservation.status_code ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${getStatusColor(reservation.status_code)} font-medium`}
                          >
                            {getStatusCodeToText(reservation.status_code)}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(reservation.id_uuid, 'allow')}
                            className="cursor-pointer"
                          >
                            <span className="text-blue-600">승인</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(reservation.id_uuid, 'deny')}
                            className="cursor-pointer"
                          >
                            <span className="text-red-600">거절</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(reservation.id_uuid, 'complete')}
                            className="cursor-pointer"
                          >
                            <span className="text-green-600">완료</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColor(
                          reservation.status_code
                        )}`}
                      >
                        {getStatusCodeToText(reservation.status_code)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}