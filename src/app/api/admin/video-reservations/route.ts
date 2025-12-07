import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/admin/auth';
import { pool } from '@/lib/db';
import {
  VideoReservationListItem,
  VideoReservationListResponse,
  VideoReservationStatus,
  VideoConsultTimeSlot,
  STATUS_PRIORITY,
} from '@/models/videoConsultReservation.dto';

/**
 * GET /api/admin/video-reservations
 * 영상상담 예약 목록 조회
 */
export async function GET(request: NextRequest) {
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

  // 3. Parse query parameters
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const sort = searchParams.get('sort') || 'status';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  // Parse status filter
  const statusFilter: VideoReservationStatus[] = statusParam
    ? (statusParam.split(',') as VideoReservationStatus[])
    : [];

  // 4. Build SQL query
  let whereClause = `WHERE vr.id_uuid_hospital = $1 AND cs.submission_type = 'video_consult'`;
  const queryParams: (string | string[])[] = [hospitalId];

  if (statusFilter.length > 0) {
    queryParams.push(statusFilter);
    whereClause += ` AND vr.status = ANY($${queryParams.length})`;
  }

  // Build ORDER BY clause
  let orderByClause: string;
  switch (sort) {
    case 'created_at_desc':
      orderByClause = 'vr.created_at DESC';
      break;
    case 'created_at_asc':
      orderByClause = 'vr.created_at ASC';
      break;
    case 'preferred_date_asc':
      orderByClause = 'earliest_start ASC NULLS LAST';
      break;
    case 'status':
    default:
      // Use CASE for status priority ordering
      const statusCases = STATUS_PRIORITY.map(
        (s, i) => `WHEN '${s}' THEN ${i}`
      ).join(' ');
      orderByClause = `CASE vr.status ${statusCases} ELSE 999 END, earliest_start ASC NULLS LAST`;
      break;
  }

  // 5. Count total
  const countQuery = `
    SELECT COUNT(*) as total
    FROM consult_video_reservations vr
    JOIN consultation_submissions cs ON cs.id_uuid = vr.id_uuid_submission
    ${whereClause}
  `;

  const { rows: countRows } = await pool.query(countQuery, queryParams);
  const totalCount = parseInt(countRows[0].total, 10);

  // 6. Fetch items with pagination
  const offset = (page - 1) * pageSize;
  const dataQuery = `
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
      vr.zoom_meeting_id,
      vr.zoom_join_url,
      vr.zoom_meeting_password,
      cs.private_first_name,
      cs.private_last_name,
      cs.private_email,
      cs.private_gender,
      cs.private_age_range,
      cs.country,
      (
        SELECT MIN((slot->>'start')::timestamptz)
        FROM jsonb_array_elements(vr.requested_slots) AS slot
      ) as earliest_start
    FROM consult_video_reservations vr
    JOIN consultation_submissions cs ON cs.id_uuid = vr.id_uuid_submission
    ${whereClause}
    ORDER BY ${orderByClause}
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;

  const { rows } = await pool.query(dataQuery, [...queryParams, pageSize, offset]);

  // 7. Transform data
  const items: VideoReservationListItem[] = rows.map((row) => {
    const requestedSlots: VideoConsultTimeSlot[] = row.requested_slots || [];

    // Calculate earliest requested start
    let earliestStart: string | null = null;
    if (requestedSlots.length > 0) {
      const starts = requestedSlots.map((s) => new Date(s.start).getTime());
      const minStart = Math.min(...starts);
      earliestStart = new Date(minStart).toISOString();
    }

    return {
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
      zoom_meeting_id: row.zoom_meeting_id,
      zoom_join_url: row.zoom_join_url,
      zoom_meeting_password: row.zoom_meeting_password,
      earliest_requested_start: earliestStart,
    };
  });

  const response: VideoReservationListResponse = {
    items,
    page,
    pageSize,
    totalCount,
  };

  return NextResponse.json(response);
}
