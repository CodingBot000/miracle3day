"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronLeft, Calendar, MapPin, Video, CheckCircle, XCircle, Hourglass, PlayCircle, RefreshCw, AlertCircle, UserX } from "lucide-react";
import Link from "next/link";
import LottieLoading from "@/components/atoms/LottieLoading";
import { VideoReservationStatus } from "@/constants/reservation";

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
}

const STATUS_CONFIG: Record<VideoReservationStatus, {
  label: { en: string; ko: string };
  color: string;
  icon: typeof Hourglass;
}> = {
  requested: {
    label: { en: 'Pending', ko: '대기중' },
    color: 'bg-yellow-100 text-yellow-800',
    icon: Hourglass,
  },
  approved: {
    label: { en: 'Approved', ko: '승인됨' },
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  rejected: {
    label: { en: 'Rejected', ko: '거부됨' },
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  needs_change: {
    label: { en: 'Change Requested', ko: '변경요청' },
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle,
  },
  rescheduled: {
    label: { en: 'Rescheduled', ko: '재요청됨' },
    color: 'bg-purple-100 text-purple-800',
    icon: RefreshCw,
  },
  completed: {
    label: { en: 'Completed', ko: '완료' },
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
  no_show: {
    label: { en: 'No Show', ko: '노쇼' },
    color: 'bg-gray-100 text-gray-800',
    icon: UserX,
  },
};

export default function ReservationListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation_Video_Consult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
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

    fetchReservations();
  }, [router]);

  const formatDateTime = (isoString: string, timezone: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: locale !== 'ko',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
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
            Video Consultation Reservations
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
              <p>No reservations yet</p>
              <p className="text-sm mt-2">
                Book a video consultation from the hospital detail page
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => {
                const statusConfig = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.requested;
                const StatusIcon = statusConfig.icon;

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
                        {statusConfig.label[locale as 'en' | 'ko'] || statusConfig.label.en}
                      </span>
                    </div>

                    {/* Requested Slots */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Requested Times:
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
                        Requested: {formatDate(reservation.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {reservation.user_timezone}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                      {/* Join Video Consultation Button */}
                      {reservation.status === 'approved' ? (
                        <Link
                          href={`/${locale}/mobile/consult-daily/${reservation.id_uuid}?role=patient`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <PlayCircle className="w-4 h-4" />
                          {locale === 'ko' ? '화상상담 입장' : 'Join Consultation'}
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
                        >
                          <PlayCircle className="w-4 h-4" />
                          {locale === 'ko' ? '화상상담 입장' : 'Join Consultation'}
                        </button>
                      )}

                      {/* View Hospital Button */}
                      {reservation.id_uuid_hospital && (
                        <Link
                          href={`/${locale}/hospital/${reservation.id_uuid_hospital}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                        >
                          <MapPin className="w-4 h-4" />
                          View Hospital
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
