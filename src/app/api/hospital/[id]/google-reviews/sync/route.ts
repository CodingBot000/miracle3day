/**
 * POST /api/hospital/[id]/google-reviews/sync
 * Triggers sync from Google Places API to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncHospitalReviews } from '@/server/googleReviews/sync';
import { q } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idUuidHospital = params.id;

    if (!idUuidHospital) {
      return NextResponse.json(
        { error: 'Hospital ID is required' },
        { status: 400 }
      );
    }

    // Get hospital searchKey
    const hospitalRows = await q(
      'SELECT searchkey FROM public.hospital WHERE id_uuid = $1',
      [idUuidHospital]
    );

    if (hospitalRows.length === 0) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }

    const searchKey = hospitalRows[0].searchkey;

    // Optional: force sync flag
    const body = await request.json().catch(() => ({}));
    const forceSync = body.forceSync === true;

    // Perform sync
    const result = await syncHospitalReviews({
      idUuidHospital,
      searchKey,
      forceSync,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Sync failed', result },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      placeId: result.placeId,
      rating: result.rating,
      userRatingCount: result.userRatingCount,
      reviewsCount: result.reviewsCount,
    });
  } catch (error) {
    console.error('[POST /api/hospital/[id]/google-reviews/sync] Error:', error);
    return NextResponse.json(
      { error: 'Failed to sync reviews' },
      { status: 500 }
    );
  }
}
