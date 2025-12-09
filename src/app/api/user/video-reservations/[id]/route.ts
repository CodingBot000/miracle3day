import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-helper';
import { pool } from '@/lib/db';
import type { VideoReservationStatus } from '@/models/videoConsultReservation.dto';

/**
 * User-facing API for video consultation reservation actions
 *
 * PATCH /api/user/video-reservations/[id]
 *
 * Actions:
 * - accept_hospital_proposal: User accepts one of hospital's proposed times
 * - reject_hospital_proposal: User rejects proposal and reverts to "requested"
 * - cancel_by_patient: User cancels their reservation
 */

type UserReservationPatchBody =
  | {
      action: 'accept_hospital_proposal';
      selectedRank: number; // Which proposed slot the user selected (1-based index)
    }
  | {
      action: 'reject_hospital_proposal';
    }
  | {
      action: 'cancel_by_patient';
      cancellationReason?: string;
    };

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user from Iron-session
    const authSession = await getAuthSession(req);

    if (!authSession) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const { userId } = authSession;

    // Parse request body
    const body: UserReservationPatchBody = await req.json();

    // Verify ownership before any action
    const { rows: existingRows } = await pool.query(
      `SELECT id_uuid_member, status FROM consult_video_reservations WHERE id_uuid = $1`,
      [id]
    );

    if (existingRows.length === 0) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    const existing = existingRows[0];

    // Verify the reservation belongs to this user
    if (existing.id_uuid_member !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - Not your reservation' },
        { status: 403 }
      );
    }

    // Get full reservation details for action processing
    const { rows: [reservation] } = await pool.query(
      `SELECT * FROM consult_video_reservations WHERE id_uuid = $1`,
      [id]
    );

    const currentStatus = reservation.status as VideoReservationStatus;

    // Handle different actions
    switch (body.action) {
      case 'accept_hospital_proposal': {
        // Can only accept from 'needs_change' status
        if (currentStatus !== 'needs_change') {
          return NextResponse.json(
            { error: 'Cannot accept proposal - reservation is not in needs_change status' },
            { status: 400 }
          );
        }

        // Validate hospital_proposed_slots exists
        if (!reservation.hospital_proposed_slots ||
            !Array.isArray(reservation.hospital_proposed_slots) ||
            reservation.hospital_proposed_slots.length === 0) {
          return NextResponse.json(
            { error: 'No hospital proposals available' },
            { status: 400 }
          );
        }

        // Find the selected slot by rank
        const selectedSlot = reservation.hospital_proposed_slots.find(
          (slot: any) => slot.rank === body.selectedRank
        );

        if (!selectedSlot) {
          return NextResponse.json(
            { error: 'Invalid slot rank selected' },
            { status: 400 }
          );
        }

        // Update reservation:
        // - Set status to 'rescheduled'
        // - Store the accepted rank in patient_accepted_proposal_rank
        // - Clear hospital_proposed_slots (user has made their choice)
        await pool.query(
          `UPDATE consult_video_reservations
           SET status = 'rescheduled',
               patient_accepted_proposal_rank = $1,
               hospital_proposed_slots = NULL,
               status_changed_at = NOW(),
               updated_at = NOW()
           WHERE id_uuid = $2`,
          [body.selectedRank, id]
        );

        return NextResponse.json({
          success: true,
          message: 'Hospital proposal accepted successfully',
          selectedSlot,
          newStatus: 'rescheduled',
        });
      }

      case 'reject_hospital_proposal': {
        // Can only reject from 'needs_change' status
        if (currentStatus !== 'needs_change') {
          return NextResponse.json(
            { error: 'Cannot reject proposal - reservation is not in needs_change status' },
            { status: 400 }
          );
        }

        // Revert to 'requested' status
        // Clear hospital_proposed_slots and patient_accepted_proposal_rank
        await pool.query(
          `UPDATE consult_video_reservations
           SET status = 'requested',
               hospital_proposed_slots = NULL,
               patient_accepted_proposal_rank = NULL,
               status_changed_at = NOW(),
               updated_at = NOW()
           WHERE id_uuid = $1`,
          [id]
        );

        return NextResponse.json({
          success: true,
          message: 'Hospital proposal rejected - reservation returned to requested status',
          newStatus: 'requested',
        });
      }

      case 'cancel_by_patient': {
        // Cannot cancel if already completed or cancelled
        if (currentStatus === 'completed') {
          return NextResponse.json(
            { error: 'Cannot cancel a completed consultation' },
            { status: 400 }
          );
        }

        if (currentStatus === 'cancelled') {
          return NextResponse.json(
            { error: 'This reservation is already cancelled' },
            { status: 400 }
          );
        }

        // Update reservation to cancelled status
        // Set cancelled_by = 'patient', store reason, and set cancelled_at timestamp
        await pool.query(
          `UPDATE consult_video_reservations
           SET status = 'cancelled',
               cancelled_by = 'patient',
               cancellation_reason = $1,
               cancelled_at = NOW(),
               status_changed_at = NOW(),
               updated_at = NOW()
           WHERE id_uuid = $2`,
          [body.cancellationReason || null, id]
        );

        return NextResponse.json({
          success: true,
          message: 'Reservation cancelled successfully',
          newStatus: 'cancelled',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error('[User Video Reservation API Error]', error);

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
