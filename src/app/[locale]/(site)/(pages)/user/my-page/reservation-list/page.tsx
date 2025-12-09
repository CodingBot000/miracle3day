"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronLeft, Calendar, MapPin, Video, CheckCircle, XCircle, Hourglass, PlayCircle, RefreshCw, AlertCircle, UserX, ExternalLink, Ban, MessageSquare } from "lucide-react";
import Link from "next/link";
import LottieLoading from "@/components/atoms/LottieLoading";
import { VideoReservationStatus, VideoConsultTimeSlot } from "@/models/videoConsultReservation.dto";
import { HospitalProposalModal } from "./components/HospitalProposalModal";
import { CancellationModal } from "./components/CancellationModal";

// Import locale files
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

interface RequestedSlot {
  rank: number;
  start: string;
  sourceTimezone: string;
}

interface Reservation_Video_Consult {
  id_uuid: string;
  id_uuid_submission: string;
  id_uuid_hospital: string | null;
  requested_slots: RequestedSlot[];
  user_timezone: string;
  status: VideoReservationStatus;
  status_changed_at: string;
  created_at: string;
  hospital_name: string | null;
  hospital_name_en: string | null;
  submission_type: string | null;
  // Daily.co
  meeting_room_id?: string | null;
  // Zoom
  zoom_join_url?: string | null;
  // Hospital proposed slots (for needs_change status)
  hospital_proposed_slots?: VideoConsultTimeSlot[] | null;
}

// Status config - colors and icons only (labels come from locale files)
const STATUS_CONFIG: Record<VideoReservationStatus, {
  color: string;
  icon: typeof Hourglass;
}> = {
  requested: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Hourglass,
  },
  approved: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  needs_change: {
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle,
  },
  rescheduled: {
    color: 'bg-purple-100 text-purple-800',
    icon: RefreshCw,
  },
  completed: {
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
  no_show: {
    color: 'bg-gray-100 text-gray-800',
    icon: UserX,
  },
  cancelled: {
    color: 'bg-gray-200 text-gray-700',
    icon: Ban,
  },
};

export default function ReservationListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation_Video_Consult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();

  // Modal states
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation_Video_Consult | null>(null);

  // Get translations from locale files
  const t = getTranslations(locale);

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/consult/video/reservations");
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?redirect=/user/my-page/reservation-list");
          return;
        }
        throw new Error(data.error || 'Failed to fetch reservations');
      }

      setReservations(data.reservations || []);
    } catch (err: any) {
      console.error("[ReservationListPage] Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [router]);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchReservations();
  };

  const formatDateTime = (isoString: string, timezone: string) => {
    try {
      const date = new Date(isoString);
      const localeMap: Record<string, string> = {
        en: 'en-US',
        ko: 'ko-KR',
        ja: 'ja-JP',
        'zh-CN': 'zh-CN',
        'zh-TW': 'zh-TW',
      };
      return new Intl.DateTimeFormat(localeMap[locale] || 'en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: locale !== 'ko' && locale !== 'ja',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const localeMap: Record<string, string> = {
        en: 'en-US',
        ko: 'ko-KR',
        ja: 'ja-JP',
        'zh-CN': 'zh-CN',
        'zh-TW': 'zh-TW',
      };
      return new Intl.DateTimeFormat(localeMap[locale] || 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const getHospitalName = (reservation: Reservation_Video_Consult): string => {
    if (locale === 'ko' && reservation.hospital_name) {
      return reservation.hospital_name;
    }
    return reservation.hospital_name_en || reservation.hospital_name || 'Hospital not specified';
  };

  const handleRespondToProposal = (reservation: Reservation_Video_Consult) => {
    setSelectedReservation(reservation);
    setProposalModalOpen(true);
  };

  const handleCancelReservation = (reservation: Reservation_Video_Consult) => {
    setSelectedReservation(reservation);
    setCancelModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LottieLoading size={200} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center border-b sticky top-0 z-10">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold ml-2">
            {t.reservationList.title}
          </h1>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {/* Reservation List */}
        <div className="p-4">
          {reservations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t.reservationList.noReservations}</p>
              <p className="text-sm mt-2">
                {t.reservationList.bookHint}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => {
                const statusConfig = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.requested;
                const StatusIcon = statusConfig.icon;
                const statusLabel = t.status[reservation.status as keyof typeof t.status] || reservation.status;

                // Check if actions are allowed
                const canCancel = reservation.status !== 'completed' && reservation.status !== 'cancelled' && reservation.status !== 'rejected';
                const needsResponse = reservation.status === 'needs_change';

                return (
                  <div
                    key={reservation.id_uuid}
                    className="bg-white rounded-lg p-4 shadow-sm border"
                  >
                    {/* Header with Hospital Name and Status */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-lg">
                          {getHospitalName(reservation)}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusLabel}
                      </span>
                    </div>

                    {/* Needs Change Alert */}
                    {needsResponse && (
                      <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                        <MessageSquare className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-800">
                          {t.reservationList.needsChangeAlert}
                        </div>
                      </div>
                    )}

                    {/* Requested Slots */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">
                        {t.reservationList.requestedTimes}:
                      </p>
                      <div className="space-y-1">
                        {reservation.requested_slots?.map((slot, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                              {slot.rank}
                            </span>
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDateTime(slot.start, reservation.user_timezone)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                      <span>
                        {t.reservationList.createdAt}: {formatDate(reservation.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {reservation.user_timezone}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                      {/* Respond to Proposal Button (needs_change status) */}
                      {needsResponse && (
                        <button
                          onClick={() => handleRespondToProposal(reservation)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {t.reservationList.respondToProposal}
                        </button>
                      )}

                      {/* Join Video Consultation Buttons */}
                      {reservation.status === 'approved' ? (
                        <>
                          {/* Daily.co 링크 */}
                          {reservation.meeting_room_id && (
                            <Link
                              href={`/${locale}/mobile/consult-daily/${reservation.id_uuid}?role=patient`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <PlayCircle className="w-4 h-4" />
                              {t.reservationList.joinDailyco}
                            </Link>
                          )}

                          {/* Zoom 링크 */}
                          {reservation.zoom_join_url && (
                            <a
                              href={reservation.zoom_join_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {t.reservationList.joinZoom}
                            </a>
                          )}

                          {/* 둘 다 없을 경우 기본 버튼 */}
                          {!reservation.meeting_room_id && !reservation.zoom_join_url && (
                            <Link
                              href={`/${locale}/mobile/consult-daily/${reservation.id_uuid}?role=patient`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              <PlayCircle className="w-4 h-4" />
                              {t.reservationList.joinConsultation}
                            </Link>
                          )}
                        </>
                      ) : reservation.status !== 'needs_change' && (
                        <button
                          disabled
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
                        >
                          <PlayCircle className="w-4 h-4" />
                          {t.reservationList.joinConsultation}
                        </button>
                      )}

                      {/* View Hospital Button */}
                      {reservation.id_uuid_hospital && (
                        <Link
                          href={`/${locale}/hospital/${reservation.id_uuid_hospital}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                        >
                          <MapPin className="w-4 h-4" />
                          {t.reservationList.viewHospital}
                        </Link>
                      )}

                      {/* Cancel Button */}
                      {canCancel && (
                        <button
                          onClick={() => handleCancelReservation(reservation)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          <Ban className="w-4 h-4" />
                          {t.reservationList.cancelReservation}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedReservation && (
        <>
          <HospitalProposalModal
            open={proposalModalOpen}
            onOpenChange={setProposalModalOpen}
            reservation={selectedReservation}
            locale={locale}
            onSuccess={handleRefresh}
          />

          <CancellationModal
            open={cancelModalOpen}
            onOpenChange={setCancelModalOpen}
            reservation={selectedReservation}
            locale={locale}
            onSuccess={handleRefresh}
          />
        </>
      )}
    </div>
  );
}
