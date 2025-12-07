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
import { VideoReservationListItem } from '@/models/videoConsultReservation.dto';

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: VideoReservationListItem;
  action: 'mark_completed' | 'mark_no_show';
  title: string;
  description: string;
  onSuccess: () => void;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  reservation,
  action,
  title,
  description,
  onSuccess,
}: ConfirmActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/video-reservations/${reservation.id_uuid}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '처리에 실패했습니다.');
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded my-4">
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
          <Button
            variant={action === 'mark_no_show' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? '처리중...' : '확인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
