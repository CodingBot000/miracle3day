import { log } from '@/utils/logger';
import { NextRequest, NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getUserAPIServer } from '@/app/api/auth/getUser/getUser.server';

interface TimeSlot {
  rank: number;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
}

interface RequestedSlot {
  rank: number;
  start: string; // ISO timestamp in UTC
  sourceTimezone: string;
}

/**
 * Convert local date/time to UTC ISO timestamp
 */
function convertLocalToUtc(date: string, time: string, timezone: string): string {
  // Combine date and time: '2025-12-01' + 'T' + '10:00:00'
  const localDateTime = `${date}T${time}:00`;

  // Create a date object with the specified timezone
  // Using Intl.DateTimeFormat to handle timezone conversion
  const localDate = new Date(localDateTime);

  // Get the offset for the given timezone at this specific date
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(localDate);
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || '';

  // Reconstruct the date in the target timezone
  const tzYear = getValue('year');
  const tzMonth = getValue('month');
  const tzDay = getValue('day');
  const tzHour = getValue('hour');
  const tzMinute = getValue('minute');
  const tzSecond = getValue('second');

  // Create a UTC date by parsing the local time as if it were UTC, then adjusting
  const utcDate = new Date(`${tzYear}-${tzMonth}-${tzDay}T${tzHour}:${tzMinute}:${tzSecond}Z`);

  // Calculate offset
  const localAsUtc = new Date(`${date}T${time}:00Z`);
  const offset = localAsUtc.getTime() - utcDate.getTime();

  // Apply offset to get correct UTC time
  const correctUtc = new Date(localAsUtc.getTime() - offset);

  return correctUtc.toISOString();
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userResult = await getUserAPIServer();
    if (!userResult?.userInfo?.id_uuid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idUuidMember = userResult.userInfo.id_uuid;

    // Parse request body
    const body = await request.json();
    const { submissionId, slots, userTimezone, hospitalId } = body;
    const idUuidHospital = hospitalId || null;

    // Validate required fields
    if (!submissionId || !Array.isArray(slots) || slots.length === 0 || !userTimezone) {
      return NextResponse.json(
        { error: 'Invalid payload. Required: submissionId, slots (array), userTimezone' },
        { status: 400 }
      );
    }

    // Validate each slot
    for (const slot of slots) {
      if (!slot.date || !slot.startTime) {
        return NextResponse.json(
          { error: 'Each slot must have date and startTime' },
          { status: 400 }
        );
      }
    }

    // Convert slots to UTC timestamps
    const requestedSlots: RequestedSlot[] = slots.map((slot: TimeSlot) => {
      try {
        const startUtc = convertLocalToUtc(slot.date, slot.startTime, userTimezone);

        return {
          rank: slot.rank,
          start: startUtc,
          sourceTimezone: userTimezone,
        };
      } catch (error) {
        throw new Error(`Failed to convert slot ${slot.rank} to UTC: ${error}`);
      }
    });

    log.debug('=== Video Reservation Creation ===');
    log.debug('submissionId:', submissionId);
    log.debug('idUuidMember:', idUuidMember);
    log.debug('userTimezone:', userTimezone);
    log.debug('originalSlots:', slots);
    log.debug('requestedSlots:', requestedSlots);

    // Insert into database
    const sql = `
      INSERT INTO consult_video_reservations (
        id_uuid_submission,
        id_uuid_member,
        id_uuid_hospital,
        requested_slots,
        user_timezone,
        status,
        status_changed_at
      ) VALUES ($1, $2, $3, $4, $5, 'requested', now())
      RETURNING id_uuid
    `;

    const params = [
      submissionId,
      idUuidMember,
      idUuidHospital,
      JSON.stringify(requestedSlots),
      userTimezone,
    ];

    const result = await q(sql, params);

    if (!result || result.length === 0) {
      console.error('Database error: No result returned');
      return NextResponse.json(
        { error: 'Failed to create video consultation reservation' },
        { status: 500 }
      );
    }

    const reservationId = result[0].id_uuid;

    log.debug('Video reservation created successfully:', reservationId);

    return NextResponse.json({
      success: true,
      reservationId,
    }, { status: 200 });

  } catch (error: any) {
    console.error('POST /api/consult/video/reservations error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET - 로그인 유저의 영상상담 예약 목록 조회
 * consultation_submissions.submission_type = 'video_consult'인 것만 조회
 */
export async function GET() {
  try {
    // Check authentication
    const userResult = await getUserAPIServer();
    if (!userResult?.userInfo?.id_uuid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idUuidMember = userResult.userInfo.id_uuid;

    // 영상상담 예약 목록 조회 (consultation_submissions와 JOIN하여 video_consult만 필터링)
    const sql = `
      SELECT
        cvr.id_uuid,
        cvr.id_uuid_submission,
        cvr.id_uuid_hospital,
        cvr.requested_slots,
        cvr.user_timezone,
        cvr.status,
        cvr.status_changed_at,
        cvr.created_at,
        cvr.meeting_room_id,
        cvr.zoom_join_url,
        h.name,
        h.name_en,
        cs.submission_type
      FROM consult_video_reservations cvr
      LEFT JOIN hospital h ON cvr.id_uuid_hospital = h.id_uuid
      LEFT JOIN consultation_submissions cs ON cvr.id_uuid_submission = cs.id_uuid
      WHERE cvr.id_uuid_member = $1
        AND (cs.submission_type = 'video_consult' OR cs.submission_type IS NULL)
      ORDER BY cvr.created_at DESC
    `;

    const result = await q(sql, [idUuidMember]);

    log.debug('=== Video Reservations List ===');
    log.debug('idUuidMember:', idUuidMember);
    log.debug('count:', result?.length || 0);

    return NextResponse.json({
      success: true,
      reservations: result || [],
    }, { status: 200 });

  } catch (error: any) {
    console.error('GET /api/consult/video/reservations error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
