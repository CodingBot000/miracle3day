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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { VideoConsultTimeSlot } from '@/models/videoConsultReservation.dto';

// Import locale files
import enTranslations from '@/locales/en/reservation.json';
import koTranslations from '@/locales/ko/reservation.json';
import jaTranslations from '@/locales/ja/reservation.json';
import zhCNTranslations from '@/locales/zh-CN/reservation.json';
import zhTWTranslations from '@/locales/zh-TW/reservation.json';

interface RequestedSlot {
  rank: number;
  start: string;
  sourceTimezone: string;
}

interface ReservationForModal {
  id_uuid: string;
  requested_slots: RequestedSlot[];
  user_timezone: string;
  hospital_proposed_slots?: VideoConsultTimeSlot[] | null;
  hospital_name?: string | null;
}

interface HospitalProposalModalProps {
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

export function HospitalProposalModal({
  open,
  onOpenChange,
  reservation,
  locale,
  onSuccess,
}: HospitalProposalModalProps) {
  const t = getTranslations(locale);

  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Format time slot for display
  const formatTimeSlot = (slot: RequestedSlot | VideoConsultTimeSlot) => {
    try {
      const date = new Date(slot.start);
      const localeMap: Record<string, string> = {
        en: 'en-US',
        ko: 'ko-KR',
        ja: 'ja-JP',
        'zh-CN': 'zh-CN',
        'zh-TW': 'zh-TW',
      };
      return new Intl.DateTimeFormat(localeMap[locale] || 'en-US', {
        timeZone: slot.sourceTimezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return slot.start;
    }
  };

  const handleAccept = () => {
    if (!selectedRank) {
      setError(t.hospitalProposalModal.selectTimeLabel);
      return;
    }
    setConfirmAction('accept');
    setShowConfirm(true);
  };

  const handleReject = () => {
    setConfirmAction('reject');
    setShowConfirm(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    setIsLoading(true);
    setError(null);

    try {
      const body =
        confirmAction === 'accept'
          ? { action: 'accept_hospital_proposal', selectedRank }
          : { action: 'reject_hospital_proposal' };

      const res = await fetch(`/api/user/video-reservations/${reservation.id_uuid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.errors.unknownError);
      }

      const successMessage =
        confirmAction === 'accept'
          ? t.hospitalProposalModal.successAccepted
          : t.hospitalProposalModal.successRejected;

      alert(successMessage);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.unknownError);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setConfirmAction(null);
    }
  };

  if (!reservation.hospital_proposed_slots || reservation.hospital_proposed_slots.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.hospitalProposalModal.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-red-600">{t.hospitalProposalModal.noProposalsError}</p>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>{t.hospitalProposalModal.cancelButton}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirmation dialog
  if (showConfirm && confirmAction) {
    const title =
      confirmAction === 'accept'
        ? t.hospitalProposalModal.acceptConfirmTitle
        : t.hospitalProposalModal.rejectConfirmTitle;
    const message =
      confirmAction === 'accept'
        ? t.hospitalProposalModal.acceptConfirmMessage
        : t.hospitalProposalModal.rejectConfirmMessage;

    return (
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded my-4">{error}</div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirm(false);
                setConfirmAction(null);
              }}
              disabled={isLoading}
            >
              {t.actions.cancel}
            </Button>
            <Button
              variant={confirmAction === 'reject' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
              disabled={isLoading}
            >
              {isLoading ? t.common.processing : t.actions.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Main proposal selection dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.hospitalProposalModal.title}</DialogTitle>
          <DialogDescription>{t.hospitalProposalModal.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Display user's original requested times */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">{t.hospitalProposalModal.yourRequestedTimes}</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {reservation.requested_slots.map((slot, idx) => (
                <li key={idx}>
                  {t.hospitalProposalModal.timeSlotLabel.replace('{{rank}}', String(slot.rank))}: {formatTimeSlot(slot)}
                </li>
              ))}
            </ul>
          </div>

          {/* Display hospital's proposed times with radio selection */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{t.hospitalProposalModal.hospitalProposedTimes}</h3>
            <RadioGroup
              value={selectedRank?.toString() || ''}
              onValueChange={(value) => setSelectedRank(parseInt(value, 10))}
            >
              <div className="space-y-2">
                {reservation.hospital_proposed_slots.map((slot) => (
                  <div
                    key={slot.rank}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                      selectedRank === slot.rank
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRank(slot.rank)}
                  >
                    <RadioGroupItem value={slot.rank.toString()} id={`slot-${slot.rank}`} />
                    <Label htmlFor={`slot-${slot.rank}`} className="flex-1 cursor-pointer text-sm">
                      <span className="font-medium">
                        {t.hospitalProposalModal.timeSlotLabel.replace('{{rank}}', String(slot.rank))}
                      </span>
                      : {formatTimeSlot(slot)}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
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
            {t.hospitalProposalModal.cancelButton}
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {t.hospitalProposalModal.rejectButton}
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isLoading || !selectedRank}
            className="w-full sm:w-auto"
          >
            {isLoading ? t.common.processing : t.hospitalProposalModal.acceptButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
