'use client';

import React, { useState } from 'react';
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
import { VideoReservationListItem } from '@/models/videoConsultReservation.dto';

interface RejectReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: VideoReservationListItem;
  onSuccess: () => void;
}

const REJECT_REASON_CODES = [
  { code: 'no_capacity', label: '일정 여유 없음' },
  { code: 'not_eligible', label: '상담 대상 아님' },
  { code: 'duplicate', label: '중복 요청' },
  { code: 'other', label: '기타' },
];

export function RejectReservationDialog({
  open,
  onOpenChange,
  reservation,
  onSuccess,
}: RejectReservationDialogProps) {
  const [reasonCode, setReasonCode] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/video-reservations/${reservation.id_uuid}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reject',
            cancelReasonCode: reasonCode || null,
            cancelReasonText: reasonText || null,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '거부 처리에 실패했습니다.');
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '거부 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>예약 거부</DialogTitle>
          <DialogDescription>
            이 예약을 거부합니다. 거부 사유를 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="reasonCode">거부 사유</Label>
            <select
              id="reasonCode"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              <option value="">선택하세요 (선택사항)</option>
              {REJECT_REASON_CODES.map((reason) => (
                <option key={reason.code} value={reason.code}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="reasonText">상세 사유 (선택사항)</Label>
            <textarea
              id="reasonText"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2 h-24 resize-none"
              placeholder="추가적인 설명이 있다면 입력해주세요."
            />
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
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '처리중...' : '거부'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
