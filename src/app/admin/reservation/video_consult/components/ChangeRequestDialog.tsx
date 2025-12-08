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
  DEFAULT_CONSULTATION_DURATION_MINUTES,
} from '@/lib/admin/dateUtils';

interface ChangeRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: VideoReservationListItem;
  onSuccess: () => void;
}

interface ProposedSlotInput {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export function ChangeRequestDialog({
  open,
  onOpenChange,
  reservation,
  onSuccess,
}: ChangeRequestDialogProps) {
  const [proposedSlots, setProposedSlots] = useState<ProposedSlotInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { minDate, maxDate } = getDateRangeFromSlots(
    reservation.requested_slots,
    'Asia/Seoul'
  );

  useEffect(() => {
    if (open) {
      // Initialize with one empty slot
      setProposedSlots([
        {
          id: crypto.randomUUID(),
          date: '',
          startTime: '',
          endTime: '',
        },
      ]);
      setError(null);
    }
  }, [open]);

  const addSlot = () => {
    setProposedSlots((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        date: '',
        startTime: '',
        endTime: '',
      },
    ]);
  };

  const removeSlot = (id: string) => {
    setProposedSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const updateSlot = (
    id: string,
    field: keyof ProposedSlotInput,
    value: string
  ) => {
    setProposedSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSubmit = async () => {
    // Validate all slots
    const validSlots = proposedSlots.filter(
      (slot) => slot.date && slot.startTime && slot.endTime
    );

    if (validSlots.length === 0) {
      setError('최소 하나의 슬롯을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const hospitalProposedSlots: VideoConsultTimeSlot[] = validSlots.map(
        (slot, index) => ({
          rank: index + 1,
          start: convertLocalToUtc(slot.date, slot.startTime, 'Asia/Seoul'),
          end: convertLocalToUtc(slot.date, slot.endTime, 'Asia/Seoul'),
          sourceTimezone: 'Asia/Seoul',
        })
      );

      const res = await fetch(
        `/api/admin/video-reservations/${reservation.id_uuid}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'request_change',
            hospitalProposedSlots,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '변경 요청에 실패했습니다.');
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '변경 요청에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>날짜/시간 변경 요청</DialogTitle>
          <DialogDescription>
            고객에게 다른 시간을 제안합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Left: Customer requested slots */}
          <div>
            <Label className="text-sm font-medium">고객 희망 시간</Label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
              {reservation.requested_slots.map((slot, index) => {
                const display = formatSlotDisplay(
                  slot,
                  reservation.user_timezone,
                  reservation.consultation_duration_minutes || DEFAULT_CONSULTATION_DURATION_MINUTES
                );
                return (
                  <div key={index} className="p-2 border rounded bg-gray-50">
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

          {/* Right: Hospital proposed slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">병원 제안 시간 (KST)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSlot}
              >
                + 슬롯 추가
              </Button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {proposedSlots.map((slot, index) => (
                <div
                  key={slot.id}
                  className="p-3 border rounded relative"
                >
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    {index + 1}순위
                  </div>
                  {proposedSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(slot.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    >
                      &times;
                    </button>
                  )}
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={slot.date}
                      onChange={(e) =>
                        updateSlot(slot.id, 'date', e.target.value)
                      }
                      min={minDate}
                      max={maxDate}
                      className="w-full border rounded px-2 py-1 text-sm"
                      placeholder="날짜"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateSlot(slot.id, 'startTime', e.target.value)
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="시작"
                      />
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateSlot(slot.id, 'endTime', e.target.value)
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="종료"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? '처리중...' : '변경 요청 보내기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
