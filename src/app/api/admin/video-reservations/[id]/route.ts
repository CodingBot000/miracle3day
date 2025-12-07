import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/admin/auth';
import { pool } from '@/lib/db';
import {
  VideoReservationListItem,
  VideoReservationStatus,
  VideoConsultTimeSlot,
  VideoReservationPatchBody,
} from '@/models/videoConsultReservation.dto';

/**
 * GET /api/admin/video-reservations/[id]
 * 영상상담 예약 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Session check
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get hospital ID from admin table
  const { rows: adminRows } = await pool.query(
    `SELECT id_uuid_hospital FROM admin WHERE id = $1`,
    [session.sub]
  );

  if (adminRows.length === 0 || !adminRows[0].id_uuid_hospital) {
    return NextResponse.json(
      { error: 'No hospital associated with this account' },
      { status: 400 }
    );
  }

  const hospitalId = adminRows[0].id_uuid_hospital;

  // 3. Fetch reservation detail
  const query = `
    SELECT
      vr.id_uuid,
      vr.created_at,
      vr.updated_at,
      vr.status,
      vr.status_changed_at,
      vr.requested_slots,
      vr.user_timezone,
      vr.hospital_proposed_slots,
      vr.confirmed_start_at,
      vr.confirmed_end_at,
      vr.consultation_duration_minutes,
      vr.id_uuid_submission as submission_id,
      vr.id_uuid_hospital,
      vr.id_uuid_member,
      vr.cancel_reason_code,
      vr.cancel_reason_text,
      vr.hospital_notes,
      vr.user_notes,
      vr.meeting_room_id,
      cs.private_first_name,
      cs.private_last_name,
      cs.private_email,
      cs.private_gender,
      cs.private_age_range,
      cs.country
    FROM consult_video_reservations vr
    JOIN consultation_submissions cs ON cs.id_uuid = vr.id_uuid_submission
    WHERE vr.id_uuid = $1 AND vr.id_uuid_hospital = $2
  `;

  const { rows } = await pool.query(query, [id, hospitalId]);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'Reservation not found' },
      { status: 404 }
    );
  }

  const row = rows[0];
  const requestedSlots: VideoConsultTimeSlot[] = row.requested_slots || [];

  // Calculate earliest requested start
  let earliestStart: string | null = null;
  if (requestedSlots.length > 0) {
    const starts = requestedSlots.map((s) => new Date(s.start).getTime());
    const minStart = Math.min(...starts);
    earliestStart = new Date(minStart).toISOString();
  }

  const item: VideoReservationListItem = {
    id_uuid: row.id_uuid,
    created_at: row.created_at?.toISOString() || '',
    updated_at: row.updated_at?.toISOString() || null,
    status: row.status as VideoReservationStatus,
    status_changed_at: row.status_changed_at?.toISOString() || null,
    requested_slots: requestedSlots,
    user_timezone: row.user_timezone || 'UTC',
    hospital_proposed_slots: row.hospital_proposed_slots || null,
    confirmed_start_at: row.confirmed_start_at?.toISOString() || null,
    confirmed_end_at: row.confirmed_end_at?.toISOString() || null,
    consultation_duration_minutes: row.consultation_duration_minutes,
    submission_id: row.submission_id,
    private_first_name: row.private_first_name,
    private_last_name: row.private_last_name,
    private_email: row.private_email,
    private_gender: row.private_gender,
    private_age_range: row.private_age_range,
    country: row.country,
    id_uuid_hospital: row.id_uuid_hospital,
    id_uuid_member: row.id_uuid_member,
    cancel_reason_code: row.cancel_reason_code,
    cancel_reason_text: row.cancel_reason_text,
    hospital_notes: row.hospital_notes,
    user_notes: row.user_notes,
    meeting_room_id: row.meeting_room_id,
    earliest_requested_start: earliestStart,
  };

  return NextResponse.json(item);
}

/**
 * PATCH /api/admin/video-reservations/[id]
 * 영상상담 예약 상태 변경
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Session check
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get hospital ID from admin table
  const { rows: adminRows } = await pool.query(
    `SELECT id_uuid_hospital FROM admin WHERE id = $1`,
    [session.sub]
  );

  if (adminRows.length === 0 || !adminRows[0].id_uuid_hospital) {
    return NextResponse.json(
      { error: 'No hospital associated with this account' },
      { status: 400 }
    );
  }

  const hospitalId = adminRows[0].id_uuid_hospital;

  // 3. Parse request body
  const body: VideoReservationPatchBody = await request.json();

  // 4. Get current reservation status
  const { rows: currentRows } = await pool.query(
    `SELECT status FROM consult_video_reservations
     WHERE id_uuid = $1 AND id_uuid_hospital = $2`,
    [id, hospitalId]
  );

  if (currentRows.length === 0) {
    return NextResponse.json(
      { error: 'Reservation not found' },
      { status: 404 }
    );
  }

  const currentStatus = currentRows[0].status as VideoReservationStatus;

  // 5. Process action
  try {
    switch (body.action) {
      case 'approve': {
        // Allowed from: requested, needs_change, rescheduled
        const allowedFromStatus: VideoReservationStatus[] = [
          'requested',
          'needs_change',
          'rescheduled',
        ];
        if (!allowedFromStatus.includes(currentStatus)) {
          return NextResponse.json(
            { error: `Cannot approve from status: ${currentStatus}` },
            { status: 400 }
          );
        }

        // Daily.co room 생성
        const confirmedEndTime = new Date(body.confirmedEnd!).getTime();
        const expirationTime = Math.floor(confirmedEndTime / 1000) + 3600; // 종료 1시간 후 만료

        const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          },
          body: JSON.stringify({
            properties: {
              exp: expirationTime,
              enable_prejoin_ui: true,
              enable_knocking: true,
              lang: 'en',
            },
          }),
        });

        if (!dailyResponse.ok) {
          const errorData = await dailyResponse.json();
          console.error('[Daily.co] Room creation failed:', errorData);
          return NextResponse.json(
            { error: 'Failed to create meeting room' },
            { status: 500 }
          );
        }

        const dailyRoom = await dailyResponse.json();
        // dailyRoom.name = "abc123xyz" (room id)
        // dailyRoom.url = "https://your-domain.daily.co/abc123xyz"

        // DB 업데이트 (meeting 정보 포함)
        const updateQuery = `
          UPDATE consult_video_reservations
          SET
            status = 'approved',
            confirmed_start_at = $1,
            confirmed_end_at = $2,
            consultation_duration_minutes = COALESCE($3, consultation_duration_minutes),
            meeting_provider = 'daily',
            meeting_room_id = $4,
            meeting_join_url_user = $5,
            meeting_join_url_hospital = $5,
            status_changed_at = NOW(),
            updated_at = NOW()
          WHERE id_uuid = $6 AND id_uuid_hospital = $7
          RETURNING *
        `;

        await pool.query(updateQuery, [
          body.confirmedStart,
          body.confirmedEnd,
          body.consultationDurationMinutes,
          dailyRoom.name,        // meeting_room_id
          dailyRoom.url,         // meeting_join_url (유저/병원 동일)
          id,
          hospitalId,
        ]);
        break;
      }

      case 'reject': {
        // Allowed from: requested, needs_change, rescheduled
        const allowedFromStatus: VideoReservationStatus[] = [
          'requested',
          'needs_change',
          'rescheduled',
        ];
        if (!allowedFromStatus.includes(currentStatus)) {
          return NextResponse.json(
            { error: `Cannot reject from status: ${currentStatus}` },
            { status: 400 }
          );
        }

        const updateQuery = `
          UPDATE consult_video_reservations
          SET
            status = 'rejected',
            cancel_reason_code = $1,
            cancel_reason_text = $2,
            status_changed_at = NOW(),
            updated_at = NOW()
          WHERE id_uuid = $3 AND id_uuid_hospital = $4
          RETURNING *
        `;

        await pool.query(updateQuery, [
          body.cancelReasonCode || null,
          body.cancelReasonText || null,
          id,
          hospitalId,
        ]);
        break;
      }

      case 'request_change': {
        // Allowed from: requested, approved, rescheduled
        const allowedFromStatus: VideoReservationStatus[] = [
          'requested',
          'approved',
          'rescheduled',
        ];
        if (!allowedFromStatus.includes(currentStatus)) {
          return NextResponse.json(
            { error: `Cannot request change from status: ${currentStatus}` },
            { status: 400 }
          );
        }

        const updateQuery = `
          UPDATE consult_video_reservations
          SET
            status = 'needs_change',
            hospital_proposed_slots = $1,
            status_changed_at = NOW(),
            updated_at = NOW()
          WHERE id_uuid = $2 AND id_uuid_hospital = $3
          RETURNING *
        `;

        await pool.query(updateQuery, [
          JSON.stringify(body.hospitalProposedSlots),
          id,
          hospitalId,
        ]);
        break;
      }

      case 'mark_completed': {
        // Allowed from: approved
        if (currentStatus !== 'approved') {
          return NextResponse.json(
            { error: `Cannot mark completed from status: ${currentStatus}` },
            { status: 400 }
          );
        }

        const updateQuery = `
          UPDATE consult_video_reservations
          SET
            status = 'completed',
            status_changed_at = NOW(),
            updated_at = NOW()
          WHERE id_uuid = $1 AND id_uuid_hospital = $2
          RETURNING *
        `;

        await pool.query(updateQuery, [id, hospitalId]);
        break;
      }

      case 'mark_no_show': {
        // Allowed from: approved
        if (currentStatus !== 'approved') {
          return NextResponse.json(
            { error: `Cannot mark no-show from status: ${currentStatus}` },
            { status: 400 }
          );
        }

        const updateQuery = `
          UPDATE consult_video_reservations
          SET
            status = 'no_show',
            no_show_flag = true,
            no_show_marked_at = NOW(),
            status_changed_at = NOW(),
            updated_at = NOW()
          WHERE id_uuid = $1 AND id_uuid_hospital = $2
          RETURNING *
        `;

        await pool.query(updateQuery, [id, hospitalId]);
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/admin/video-reservations/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    );
  }
}
