/**
 * GET /api/hospital/[id]/google-reviews
 * Returns cached Google reviews from database (never calls Google API directly)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSnapshot, getReviews } from '@/server/googleReviews/repo';
import { isStale } from '@/server/googleReviews/staleness';

export async function GET(
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

    // Get cached snapshot
    const snapshot = await getSnapshot(idUuidHospital);

    // Get cached reviews
    const reviews = await getReviews(idUuidHospital, 5);

    // Calculate if cache is stale
    const needsSync = snapshot
      ? isStale({
          lastSyncedAt: snapshot.last_synced_at,
          syncCadenceHours: snapshot.sync_cadence_hours,
        })
      : true;

    // Format response
    const response = {
      placeId: snapshot?.place_id ?? null,
      rating: snapshot?.rating ?? null,
      userRatingCount: snapshot?.user_rating_count ?? null,
      lastSyncedAt: snapshot?.last_synced_at ?? null,
      syncCadenceHours: snapshot?.sync_cadence_hours ?? 72,
      needsSync,
      reviews: reviews.map((review) => ({
        authorName: review.author_name,
        authorProfileUrl: review.author_profile_url,
        authorPhotoUrl: review.author_photo_url,
        rating: review.rating,
        reviewText: review.review_text,
        publishTime: review.publish_time,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[GET /api/hospital/[id]/google-reviews] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cached reviews' },
      { status: 500 }
    );
  }
}
