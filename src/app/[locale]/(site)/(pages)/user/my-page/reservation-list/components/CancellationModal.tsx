'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { VideoReservationStatus } from '@/models/videoConsultReservation.dto';

// Import locale files
import enTranslations from '@/locales/en/reservation.json';
import koTranslations from '@/locales/ko/reservation.json';
import jaTranslations from '@/locales/ja/reservation.json';
import zhCNTranslations from '@/locales/zh-CN/reservation.json';
import zhTWTranslations from '@/locales/zh-TW/reservation.json';

interface ReservationForModal {
  id_uuid: string;
  status: VideoReservationStatus;
  hospital_name?: string | null;
  hospital_name_en?: string | null;
}

interface CancellationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ReservationForModal;
  locale: string;
  onSuccess: () => void;
}

// Map locale to translations
const getTranslations = (locale: string) => {
  switch (locale) {
    case 'ko':
      return koTranslations;
    case 'ja':
      return jaTranslations;
    case 'zh-CN':
      return zhCNTranslations;
    case 'zh-TW':
      return zhTWTranslations;
    default:
      return enTranslations;
  }
};

export function CancellationModal({
  open,
  onOpenChange,
  reservation,
  locale,
  onSuccess,
}: CancellationModalProps) {
  const t = getTranslations(locale);

  const [cancellationReason, setCancellationReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if cancellation is allowed
  const canCancel = reservation.status !== 'completed' && reservation.status !== 'cancelled';
  const isApproved = reservation.status === 'approved';

  const getHospitalName = () => {
    if (locale === 'ko' && reservation.hospital_name) {
      return reservation.hospital_name;
    }
    return reservation.hospital_name_en || reservation.hospital_name || '';
  };

  const handleInitialSubmit = () => {
    if (!canCancel) {
      if (reservation.status === 'completed') {
        setError(t.cancellationModal.cannotCancelCompleted);
      } else if (reservation.status === 'cancelled') {
        setError(t.cancellationModal.cannotCancelCancelled);
      }
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmCancel = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/user/video-reservations/${reservation.id_uuid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'cancel_by_patient',
          cancellationReason: cancellationReason.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.cancellationModal.errorMessage);
      }

      alert(t.cancellationModal.successMessage);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.cancellationModal.errorMessage);
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmation dialog
  if (showConfirm) {
    return (
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {t.cancellationModal.title}
            </DialogTitle>
            <DialogDescription>{t.cancellationModal.description}</DialogDescription>
          </DialogHeader>

          {cancellationReason && (
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="font-semibold mb-1">{t.cancellationModal.reasonLabel}</p>
              <p className="text-gray-700">{cancellationReason}</p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirm(false);
                setError(null);
              }}
              disabled={isLoading}
            >
              {t.actions.back}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={isLoading}
            >
              {isLoading ? t.cancellationModal.loading : t.cancellationModal.confirmButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Main cancellation form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.cancellationModal.title}</DialogTitle>
          <DialogDescription>
            {isApproved && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 p-3 rounded mt-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-yellow-800">{t.cancellationModal.warningApproved}</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Reservation info summary */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
            {getHospitalName() && (
              <p>
                <span className="font-semibold">{t.reservationList.hospitalName}:</span> {getHospitalName()}
              </p>
            )}
            <p>
              <span className="font-semibold">{t.status[reservation.status as keyof typeof t.status] || reservation.status}</span>
            </p>
          </div>

          {/* Cancellation reason textarea */}
          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">{t.cancellationModal.reasonLabel}</Label>
            <Textarea
              id="cancellation-reason"
              placeholder={t.cancellationModal.reasonPlaceholder}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 text-right">{cancellationReason.length} / 500</p>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {t.cancellationModal.closeButton}
          </Button>
          <Button
            variant="destructive"
            onClick={handleInitialSubmit}
            disabled={isLoading || !canCancel}
            className="w-full sm:w-auto"
          >
            {isLoading ? t.cancellationModal.loading : t.cancellationModal.cancelButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
