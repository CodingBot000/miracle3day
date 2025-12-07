import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/admin/auth';
import { pool } from '@/lib/db';
import { createZoomMeeting, deleteZoomMeeting, ZoomError } from '@/lib/zoom';
import type {
  VideoReservationStatus,
  VideoReservationPatchBody,
} from '@/models/videoConsultReservation.dto';

/**
 * Zoom 기반 화상상담 예약 상태 변경 API
 *
 * PATCH /api/admin/video-reservations-zoom/[id]
 *
 * Actions:
 * - approve: 승인 + Zoom 미팅 생성
 * - mark_completed: 완료 + Zoom 미팅 삭제
 * - reject: 거부 + Zoom 미팅 삭제 (있으면)
 * - mark_no_show: 노쇼 + Zoom 미팅 삭제
 * - request_change: 시간 변경 제안 (Zoom 미팅은 유지)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const body: VideoReservationPatchBody = await req.json();

    // 4. 기존 예약 정보 조회
    const { rows: [reservation] } = await pool.query(
      `SELECT * FROM consult_video_reservations
       WHERE id_uuid = $1 AND id_uuid_hospital = $2`,
      [id, hospitalId]
    );

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    const currentStatus = reservation.status as VideoReservationStatus;

    // 5. Action별 처리
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

        // 1. Zoom 미팅 생성
        const meeting = await createZoomMeeting({
          topic: `Medical Consultation - ${reservation.id_uuid.slice(0, 8)}`,
          startTime: body.confirmedStart,
          duration: body.consultationDurationMinutes || 30,
        });

        // 2. DB 업데이트 (승인 + Zoom 정보 저장)
        await pool.query(
          `UPDATE consult_video_reservations
           SET status = 'approved',
               confirmed_start_at = $1,
               confirmed_end_at = $2,
               consultation_duration_minutes = $3,
               meeting_provider = 'zoom',
               zoom_meeting_id = $4,
               zoom_join_url = $5,
               zoom_meeting_password = $6,
               status_changed_at = NOW(),
               updated_at = NOW()
           WHERE id_uuid = $7 AND id_uuid_hospital = $8`,
          [
            body.confirmedStart,
            body.confirmedEnd,
            body.consultationDurationMinutes || 30,
            meeting.id.toString(),
            meeting.join_url,
            meeting.password,
            id,
            hospitalId,
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'Approved and Zoom meeting created',
          zoomUrl: meeting.join_url,
        });
      }

      case 'mark_completed': {
        // Allowed from: approved
        if (currentStatus !== 'approved') {
          return NextResponse.json(
            { error: `Cannot mark completed from status: ${currentStatus}` },
            { status: 400 }
          );
        }

        // 1. Zoom 미팅 삭제 (있으면)
        if (reservation.zoom_meeting_id) {
          try {
            await deleteZoomMeeting(reservation.zoom_meeting_id);
          } catch (error) {
            console.error('[Zoom] Failed to delete meeting:', error);
            // 삭제 실패해도 상태 업데이트는 진행
          }
        }

        // 2. DB 상태 업데이트
        await pool.query(
          `UPDATE consult_video_reservations
           SET status = 'completed',
               status_changed_at = NOW(),
               updated_at = NOW()
           WHERE id_uuid = $1 AND id_uuid_hospital = $2`,
          [id, hospitalId]
        );

        return NextResponse.json({
          success: true,
          message: 'Marked as completed and Zoom meeting deleted',
        });
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

        // 1. Zoom 미팅 삭제 (있으면)
        if (reservation.zoom_meeting_id) {
          try {
            await deleteZoomMeeting(reservation.zoom_meeting_id);
          } catch (error) {
            console.error('[Zoom] Failed to delete meeting:', error);
          }
        }

        // 2. DB 상태 업데이트
        await pool.query(
          `UPDATE consult_video_reservations
           SET status = 'rejected',
               cancel_reason_code = $1,
               cancel_reason_text = $2,
               status_changed_at = NOW(),
               updated_at = NOW()
           WHERE id_uuid = $3 AND id_uuid_hospital = $4`,
          [
            body.cancelReasonCode || null,
            body.cancelReasonText || null,
            id,
            hospitalId,
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'Rejected and Zoom meeting deleted',
        });
      }

      case 'mark_no_show': {
        // Allowed from: approved
        if (currentStatus !== 'approved') {
          return NextResponse.json(
            { error: `Cannot mark no-show from status: ${currentStatus}` },
            { status: 400 }
          );
        }

        // 1. Zoom 미팅 삭제 (있으면)
        if (reservation.zoom_meeting_id) {
          try {
            await deleteZoomMeeting(reservation.zoom_meeting_id);
          } catch (error) {
            console.error('[Zoom] Failed to delete meeting:', error);
          }
        }

        // 2. DB 상태 업데이트
        await pool.query(
          `UPDATE consult_video_reservations
           SET status = 'no_show',
               no_show_flag = true,
               no_show_marked_at = NOW(),
               status_changed_at = NOW(),
               updated_at = NOW()
           WHERE id_uuid = $1 AND id_uuid_hospital = $2`,
          [id, hospitalId]
        );

        return NextResponse.json({
          success: true,
          message: 'Marked as no-show and Zoom meeting deleted',
        });
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

        // 시간 변경 제안 (Zoom 미팅은 유지)
        await pool.query(
          `UPDATE consult_video_reservations
           SET status = 'needs_change',
               hospital_proposed_slots = $1,
               status_changed_at = NOW(),
               updated_at = NOW()
           WHERE id_uuid = $2 AND id_uuid_hospital = $3`,
          [
            JSON.stringify(body.hospitalProposedSlots),
            id,
            hospitalId,
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'Change requested',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error('[Zoom Reservation API Error]', error);

    if (error instanceof ZoomError) {
      return NextResponse.json(
        { error: `Zoom API Error: ${error.message}` },
        { status: error.statusCode || 500 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
