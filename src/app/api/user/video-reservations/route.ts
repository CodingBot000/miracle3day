import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-helper';
import { pool } from '@/lib/db';
import type { VideoReservationListItem } from '@/models/videoConsultReservation.dto';

/**
 * User-facing API to fetch their video consultation reservations
 *
 * GET /api/user/video-reservations
 *
 * Returns list of user's reservations with hospital information
 */
export async function GET(req: Request) {
  try {
    // Get user from Iron-session
    const authSession = await getAuthSession(req);

    if (!authSession) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const { userId } = authSession;

    // Fetch user's video consultation reservations
    const { rows } = await pool.query<VideoReservationListItem>(
      `SELECT
        vr.*,
        h.name as hospital_name,
        h.name_en as hospital_name_en,
        cs.private_first_name,
        cs.private_last_name,
        cs.private_email,
        cs.private_gender,
        cs.private_age_range,
        cs.country
      FROM consult_video_reservations vr
      LEFT JOIN hospitals h ON vr.id_uuid_hospital = h.id_uuid
      LEFT JOIN consultation_submissions cs ON vr.id_uuid_submission = cs.id_uuid
      WHERE vr.id_uuid_member = $1
      ORDER BY vr.created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      items: rows,
      totalCount: rows.length,
    });
  } catch (error: unknown) {
    console.error('[User Video Reservations API Error]', error);

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
