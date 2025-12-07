'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  VideoReservationListItem,
  VideoConsultTimeSlot,
} from '@/models/videoConsultReservation.dto';
import {
  convertUtcToLocal,
  convertLocalToUtc,
  getDateRangeFromSlots,
  formatSlotDisplay,
} from '@/lib/admin/dateUtils';

interface ApproveReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: VideoReservationListItem;
  onSuccess: () => void;
}

export function ApproveReservationDialog({
  open,
  onOpenChange,
  reservation,
  onSuccess,
}: ApproveReservationDialogProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { minDate, maxDate } = getDateRangeFromSlots(
    reservation.requested_slots,
    'Asia/Seoul'
  );

  // Initialize with first slot
  useEffect(() => {
    if (open && reservation.requested_slots.length > 0) {
      const firstSlot = reservation.requested_slots[0];
      const localStart = convertUtcToLocal(firstSlot.start, 'Asia/Seoul');
      const localEnd = convertUtcToLocal(firstSlot.end, 'Asia/Seoul');

      setDate(localStart.date);
      setStartTime(localStart.time);
      setEndTime(localEnd.time);
      setError(null);
    }
  }, [open, reservation.requested_slots]);

  const handleSubmit = async () => {
    if (!date || !startTime || !endTime) {
      setError('날짜와 시간을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const confirmedStart = convertLocalToUtc(date, startTime, 'Asia/Seoul');
      const confirmedEnd = convertLocalToUtc(date, endTime, 'Asia/Seoul');

      const res = await fetch(
        `/api/admin/video-reservations/${reservation.id_uuid}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'approve',
            confirmedStart,
            confirmedEnd,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '승인 처리에 실패했습니다.');
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '승인 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectSlot = (slot: VideoConsultTimeSlot) => {
    const localStart = convertUtcToLocal(slot.start, 'Asia/Seoul');
    const localEnd = convertUtcToLocal(slot.end, 'Asia/Seoul');

    setDate(localStart.date);
    setStartTime(localStart.time);
    setEndTime(localEnd.time);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>예약 승인</DialogTitle>
          <DialogDescription>
            상담 일시를 확정하고 예약을 승인합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer requested slots */}
          <div>
            <Label className="text-sm font-medium">고객 희망 시간</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {reservation.requested_slots.map((slot, index) => {
                const display = formatSlotDisplay(
                  slot,
                  reservation.user_timezone
                );
                return (
                  <div
                    key={index}
                    className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => selectSlot(slot)}
                  >
                    <div className="text-sm font-medium">
                      {index + 1}순위: {display.kstTime}
                    </div>
                    <div className="text-xs text-gray-500">
                      고객 시간: {display.userTime} ({reservation.user_timezone})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date/Time inputs */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="date">확정 날짜 (KST)</Label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minDate}
                max={maxDate}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startTime">시작 시간</Label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <Label htmlFor="endTime">종료 시간</Label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? '처리중...' : '승인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
