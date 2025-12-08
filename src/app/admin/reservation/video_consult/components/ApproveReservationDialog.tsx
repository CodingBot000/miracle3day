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
  formatSlotDisplay,
  DEFAULT_CONSULTATION_DURATION_MINUTES,
} from '@/lib/admin/dateUtils';

type VideoPlatform = 'zoom' | 'daily';

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
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<VideoPlatform>('zoom');

  // Reset to first slot when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedSlotIndex(0);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (reservation.requested_slots.length === 0) {
      setError('선택할 수 있는 시간이 없습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedSlot = reservation.requested_slots[selectedSlotIndex];
      const confirmedStart = selectedSlot.start;

      // Calculate end time if not provided
      const confirmedEnd = selectedSlot.end
        ? selectedSlot.end
        : new Date(new Date(selectedSlot.start).getTime() +
            (reservation.consultation_duration_minutes || DEFAULT_CONSULTATION_DURATION_MINUTES) * 60 * 1000
          ).toISOString();

      // 선택된 플랫폼에 따라 API 엔드포인트 결정
      const apiEndpoint = selectedPlatform === 'zoom'
        ? `/api/admin/video-reservations-zoom/${reservation.id_uuid}`
        : `/api/admin/video-reservations/${reservation.id_uuid}`;

      const res = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          confirmedStart,
          confirmedEnd,
        }),
      });

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>예약 승인</DialogTitle>
          <DialogDescription>
            고객이 요청한 희망 시간 중 하나를 선택하여 예약을 승인합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer requested slots */}
          <div>
            <Label className="text-sm font-medium">고객 희망 시간 선택</Label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
              {reservation.requested_slots.map((slot, index) => {
                const display = formatSlotDisplay(
                  slot,
                  reservation.user_timezone,
                  reservation.consultation_duration_minutes || DEFAULT_CONSULTATION_DURATION_MINUTES
                );
                const isSelected = selectedSlotIndex === index;
                return (
                  <div
                    key={index}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSlotIndex(index)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full ${
                        index === 0
                          ? 'bg-blue-500 text-white'
                          : index === 1
                          ? 'bg-green-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}>
                        {slot.rank || index + 1}
                      </span>
                      <span className="text-sm font-medium">{display.kstTime}</span>
                    </div>
                    <div className="text-xs text-gray-500 ml-8">
                      고객 시간: {display.userTime} ({reservation.user_timezone})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <Label className="text-sm font-medium">화상상담 플랫폼 선택</Label>
            <div className="mt-2 space-y-2">
              {/* Zoom 옵션 (기본값) */}
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="platform"
                  value="zoom"
                  checked={selectedPlatform === 'zoom'}
                  onChange={(e) => setSelectedPlatform(e.target.value as VideoPlatform)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Zoom</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                      권장
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    외부 링크 방식 • 안정적 • 모든 기기 지원
                  </p>
                </div>
              </label>

              {/* Daily.co 옵션 */}
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="platform"
                  value="daily"
                  checked={selectedPlatform === 'daily'}
                  onChange={(e) => setSelectedPlatform(e.target.value as VideoPlatform)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Daily.co</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      임베디드
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    사이트 내 임베디드 • 테스트용
                  </p>
                </div>
              </label>
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
