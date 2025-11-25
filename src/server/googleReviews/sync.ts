/**
 * Sync orchestration: PlaceID → Google API → DB upsert
 */

import { extractSearchQuery, isValidSearchKey } from './extract';
import { isStale } from './staleness';
import {
  getSnapshot,
  upsertSnapshot,
  markPlaceId,
  upsertReviews,
  generateReviewKey,
} from './repo';

// ============================================================================
// Types
// ============================================================================

interface SyncResult {
  success: boolean;
  placeId: string | null;
  rating: number | null;
  userRatingCount: number | null;
  reviewsCount: number;
  error?: string;
}

// ============================================================================
// PlaceID Discovery
// ============================================================================

/**
 * Get or discover placeId for a hospital
 */
async function ensurePlaceId(params: {
  idUuidHospital: string;
  searchKey: string | null;
}): Promise<string | null> {
  const { idUuidHospital, searchKey } = params;

  // Step 1: Check if we already have placeId in snapshot
  const snapshot = await getSnapshot(idUuidHospital);
  if (snapshot?.place_id) {
    return snapshot.place_id;
  }

  // Step 2: Validate searchKey
  if (!isValidSearchKey(searchKey)) {
    console.warn(`[ensurePlaceId] Invalid searchKey for hospital ${idUuidHospital}`);
    await markPlaceId(idUuidHospital, null);
    return null;
  }

  // Step 3: Search Google Places to get placeId
  try {
    const textQuery = extractSearchQuery(searchKey);
    const searchResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/places/search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textQuery, languageCode: 'en' }),
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`Places search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const places = searchData.places ?? [];

    if (places.length === 0) {
      console.warn(`[ensurePlaceId] No place found for searchKey: ${textQuery}`);
      await markPlaceId(idUuidHospital, null);
      return null;
    }

    const placeId = places[0].id;
    await markPlaceId(idUuidHospital, placeId);
    return placeId;
  } catch (error) {
    console.error(`[ensurePlaceId] Error finding placeId:`, error);
    await markPlaceId(idUuidHospital, null);
    return null;
  }
}

// ============================================================================
// Google Places Details Fetch
// ============================================================================

/**
 * Fetch details from Google Places API
 */
async function fetchGooglePlaceDetails(placeId: string): Promise<any> {
  const uiLang = 'en';
  const targetLang = 'ko';

  const detailsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/places/details?placeId=${encodeURIComponent(
      placeId
    )}&lang=ko&tl=${targetLang}&translate=true`,
    {
      headers: { 'x-ui-lang': uiLang },
    }
  );

  if (!detailsResponse.ok) {
    throw new Error(`Places details failed: ${detailsResponse.status}`);
  }

  return await detailsResponse.json();
}

// ============================================================================
// Main Sync Function
// ============================================================================

/**
 * Sync a single hospital's Google reviews to database
 */
export async function syncHospitalReviews(params: {
  idUuidHospital: string;
  searchKey: string | null;
  forceSync?: boolean;
}): Promise<SyncResult> {
  const { idUuidHospital, searchKey, forceSync = false } = params;

  try {
    // Step 1: Check if sync is needed
    if (!forceSync) {
      const snapshot = await getSnapshot(idUuidHospital);
      if (snapshot) {
        const needsSync = isStale({
          lastSyncedAt: snapshot.last_synced_at,
          syncCadenceHours: snapshot.sync_cadence_hours,
        });

        if (!needsSync) {
          log.debug(`[syncHospitalReviews] Cache is fresh for ${idUuidHospital}, skipping sync`);
          return {
            success: true,
            placeId: snapshot.place_id,
            rating: snapshot.rating ?? null,
            userRatingCount: snapshot.user_rating_count ?? null,
            reviewsCount: 0,
          };
        }
      }
    }

    // Step 2: Ensure we have placeId
    const placeId = await ensurePlaceId({ idUuidHospital, searchKey });
    if (!placeId) {
      return {
        success: false,
        placeId: null,
        rating: null,
        userRatingCount: null,
        reviewsCount: 0,
        error: 'No placeId available',
      };
    }

    // Step 3: Fetch details from Google
    const detailsData = await fetchGooglePlaceDetails(placeId);

    // Step 4: Extract data
    const rating = detailsData.rating ?? null;
    const userRatingCount = detailsData.userRatingCount ?? 0;
    const reviews = detailsData.reviews ?? [];

    // Step 5: Upsert snapshot
    await upsertSnapshot({
      idUuidHospital,
      placeId,
      rating,
      userRatingCount,
      snapshot: {
        rating,
        userRatingCount,
        syncedAt: new Date().toISOString(),
      },
    });

    // Step 6: Upsert reviews
    if (reviews.length > 0) {
      const reviewData = reviews.map((review: any) => {
        const authorUri = review.authorAttribution?.uri ?? null;
        const publishTime = review.publishTime ?? null;
        const reviewKey = generateReviewKey(authorUri, publishTime);

        return {
          idUuidHospital,
          placeId,
          reviewKey,
          authorName: review.authorAttribution?.displayName ?? null,
          authorProfileUrl: authorUri,
          authorPhotoUrl: review.authorAttribution?.photoUri ?? null,
          rating: review.rating ?? null,
          reviewText: review.text?.text ?? null,
          publishTime,
          raw: review,
        };
      });

      await upsertReviews(reviewData);
    }

    log.debug(
      `[syncHospitalReviews] Successfully synced ${idUuidHospital}: ${reviews.length} reviews`
    );

    return {
      success: true,
      placeId,
      rating,
      userRatingCount,
      reviewsCount: reviews.length,
    };
  } catch (error) {
    console.error(`[syncHospitalReviews] Error syncing ${idUuidHospital}:`, error);
    return {
      success: false,
      placeId: null,
      rating: null,
      userRatingCount: null,
      reviewsCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch sync multiple hospitals
 */
export async function syncMultipleHospitals(
  hospitals: Array<{ idUuidHospital: string; searchKey: string | null }>
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  for (const hospital of hospitals) {
    const result = await syncHospitalReviews(hospital);
    results.push(result);
  }

  return results;
}
