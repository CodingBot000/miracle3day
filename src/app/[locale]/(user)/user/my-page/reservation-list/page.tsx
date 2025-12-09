'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { HospitalProposalModal } from './components/HospitalProposalModal';
import { CancellationModal } from './components/CancellationModal';
import {
  VideoReservationListItem,
  STATUS_COLORS,
  VideoReservationStatus,
} from '@/models/videoConsultReservation.dto';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Building2, Video, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { enUS, ko, ja, zhCN, zhTW } from 'date-fns/locale';

// Import translations
import enTranslations from '@/locales/en/reservation.json';
import koTranslations from '@/locales/ko/reservation.json';
import jaTranslations from '@/locales/ja/reservation.json';
import zhCNTranslations from '@/locales/zh-CN/reservation.json';
import zhTWTranslations from '@/locales/zh-TW/reservation.json';

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

// Map locale to date-fns locale
const getDateLocale = (locale: string) => {
  switch (locale) {
    case 'ko':
      return ko;
    case 'ja':
      return ja;
    case 'zh-CN':
      return zhCN;
    case 'zh-TW':
      return zhTW;
    default:
      return enUS;
  }
};

export default function VideoReservationListPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = getTranslations(locale);
  const dateLocale = getDateLocale(locale);

  const [reservations, setReservations] = useState<VideoReservationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<VideoReservationListItem | null>(
    null
  );

  // Fetch reservations
  const fetchReservations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API endpoint once user auth is implemented
      // For now, this is a placeholder
      const res = await fetch('/api/user/video-reservations', {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(t.reservationList.loadingError);
      }

      const data = await res.json();
      setReservations(data.items || []);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      setError(err instanceof Error ? err.message : t.reservationList.loadingError);
      // For demo purposes, set empty array on error
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Format date/time
  const formatDateTime = (isoString: string, timezone?: string) => {
    const date = timezone ? toZonedTime(new Date(isoString), timezone) : new Date(isoString);
    return format(date, 'PPp', { locale: dateLocale });
  };

  // Handle opening proposal modal
  const handleRespondToProposal = (reservation: VideoReservationListItem) => {
    setSelectedReservation(reservation);
    setProposalModalOpen(true);
  };

  // Handle opening cancellation modal
  const handleCancelReservation = (reservation: VideoReservationListItem) => {
    setSelectedReservation(reservation);
    setCancelModalOpen(true);
  };

  // Get status badge color
  const getStatusColor = (status: VideoReservationStatus) => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">{t.reservationList.title}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {t.reservationList.noReservations}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reservations.map((reservation) => (
            <Card key={reservation.id_uuid} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">
                      {reservation.hospital_name || reservation.hospital_name_en || t.reservationList.hospitalName}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getStatusColor(reservation.status)}>
                        {t.status[reservation.status as keyof typeof t.status] || reservation.status}
                      </Badge>
                      {reservation.zoom_meeting_id && (
                        <Badge variant="outline" className="text-xs">
                          {t.reservationList.zoomMeeting}
                        </Badge>
                      )}
                      {reservation.meeting_room_id && !reservation.zoom_meeting_id && (
                        <Badge variant="outline" className="text-xs">
                          {t.reservationList.dailyMeeting}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status description */}
                <p className="text-sm text-gray-600">
                  {t.statusDescription[reservation.status as keyof typeof t.statusDescription]}
                </p>

                {/* Reservation details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Confirmed time (if approved) */}
                  {reservation.confirmed_start_at && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{t.reservationList.confirmedTime}</p>
                        <p className="text-gray-700">
                          {formatDateTime(
                            reservation.confirmed_start_at,
                            reservation.user_timezone
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Duration */}
                  {reservation.consultation_duration_minutes && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{t.reservationList.duration}</p>
                        <p className="text-gray-700">
                          {t.reservationList.minutes.replace(
                            '{{count}}',
                            String(reservation.consultation_duration_minutes)
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Requested times (if not approved) */}
                  {!reservation.confirmed_start_at && reservation.requested_slots && (
                    <div className="flex items-start gap-2 md:col-span-2">
                      <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{t.reservationList.requestedTimes}</p>
                        <ul className="text-gray-700 space-y-1">
                          {reservation.requested_slots.slice(0, 3).map((slot, idx) => (
                            <li key={idx}>
                              {formatDateTime(slot.start, slot.sourceTimezone)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {/* Respond to hospital proposal */}
                  {reservation.status === 'needs_change' && (
                    <Button
                      onClick={() => handleRespondToProposal(reservation)}
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {t.reservationList.respondToProposal}
                    </Button>
                  )}

                  {/* Join meeting (approved status with future time) */}
                  {reservation.status === 'approved' &&
                    reservation.confirmed_start_at &&
                    new Date(reservation.confirmed_start_at) > new Date() &&
                    (reservation.zoom_join_url || reservation.meeting_room_id) && (
                      <Button
                        onClick={() => {
                          const url = reservation.zoom_join_url || `/video-room/${reservation.meeting_room_id}`;
                          window.open(url, '_blank');
                        }}
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        {t.reservationList.joinMeeting}
                      </Button>
                    )}

                  {/* Cancel reservation */}
                  {reservation.status !== 'completed' &&
                    reservation.status !== 'cancelled' &&
                    reservation.status !== 'rejected' && (
                      <Button
                        onClick={() => handleCancelReservation(reservation)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {t.reservationList.cancelReservation}
                      </Button>
                    )}
                </div>

                {/* Created/Updated timestamps */}
                <div className="text-xs text-gray-500 pt-2 border-t flex flex-wrap gap-4">
                  <span>
                    {t.reservationList.createdAt}:{' '}
                    {format(new Date(reservation.created_at), 'PPp', { locale: dateLocale })}
                  </span>
                  {reservation.updated_at && (
                    <span>
                      {t.reservationList.updatedAt}:{' '}
                      {format(new Date(reservation.updated_at), 'PPp', { locale: dateLocale })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedReservation && (
        <>
          <HospitalProposalModal
            open={proposalModalOpen}
            onOpenChange={setProposalModalOpen}
            reservation={selectedReservation}
            locale={locale}
            translations={t}
            onSuccess={() => {
              fetchReservations();
              setSelectedReservation(null);
            }}
          />

          <CancellationModal
            open={cancelModalOpen}
            onOpenChange={setCancelModalOpen}
            reservation={selectedReservation}
            translations={t}
            onSuccess={() => {
              fetchReservations();
              setSelectedReservation(null);
            }}
          />
        </>
      )}
    </div>
  );
}
