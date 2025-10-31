/**
 * Repository layer for Google Reviews cache tables
 */

import { q, one } from '@/lib/db';
import crypto from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface HospitalGoogleSnapshot {
  id_uuid_hospital: string;
  place_id: string | null;
  rating: number | null;
  user_rating_count: number | null;
  sync_cadence_hours: number;
  last_synced_at: Date | null;
  last_changed_at: Date | null;
  snapshot: any;
}

export interface HospitalGoogleReview {
  id: number;
  id_uuid_hospital: string;
  place_id: string;
  review_key: string;
  author_name: string | null;
  author_profile_url: string | null;
  author_photo_url: string | null;
  rating: number | null;
  review_text: string | null;
  publish_time: Date | null;
  inserted_at: Date;
  updated_at: Date;
  raw: any;
}

// ============================================================================
// Snapshot (Summary) Operations
// ============================================================================

/**
 * Get snapshot for a hospital
 */
export async function getSnapshot(idUuidHospital: string): Promise<HospitalGoogleSnapshot | null> {
  const sql = `
    SELECT
      id_uuid_hospital,
      place_id,
      rating,
      user_rating_count,
      sync_cadence_hours,
      last_synced_at,
      last_changed_at,
      snapshot
    FROM public.hospital_google_snapshot
    WHERE id_uuid_hospital = $1
  `;

  return await one<HospitalGoogleSnapshot>(sql, [idUuidHospital]);
}

/**
 * Upsert snapshot (summary data)
 */
export async function upsertSnapshot(params: {
  idUuidHospital: string;
  placeId: string;
  rating: number | null;
  userRatingCount: number | null;
  snapshot?: any;
}): Promise<void> {
  const { idUuidHospital, placeId, rating, userRatingCount, snapshot } = params;

  const sql = `
    INSERT INTO public.hospital_google_snapshot (
      id_uuid_hospital,
      place_id,
      rating,
      user_rating_count,
      last_synced_at,
      last_changed_at,
      snapshot
    ) VALUES ($1, $2, $3, $4, now(), now(), $5)
    ON CONFLICT (id_uuid_hospital)
    DO UPDATE SET
      place_id = EXCLUDED.place_id,
      rating = EXCLUDED.rating,
      user_rating_count = EXCLUDED.user_rating_count,
      last_synced_at = now(),
      last_changed_at = CASE
        WHEN (
          public.hospital_google_snapshot.rating IS DISTINCT FROM EXCLUDED.rating
          OR public.hospital_google_snapshot.user_rating_count IS DISTINCT FROM EXCLUDED.user_rating_count
        )
        THEN now()
        ELSE public.hospital_google_snapshot.last_changed_at
      END,
      snapshot = EXCLUDED.snapshot
  `;

  await q(sql, [
    idUuidHospital,
    placeId,
    rating,
    userRatingCount,
    snapshot ? JSON.stringify(snapshot) : null,
  ]);
}

/**
 * Mark placeId for a hospital (when first discovered)
 */
export async function markPlaceId(idUuidHospital: string, placeId: string | null): Promise<void> {
  const sql = `
    INSERT INTO public.hospital_google_snapshot (
      id_uuid_hospital,
      place_id,
      last_synced_at
    ) VALUES ($1, $2, now())
    ON CONFLICT (id_uuid_hospital)
    DO UPDATE SET
      place_id = EXCLUDED.place_id,
      last_synced_at = now()
  `;

  await q(sql, [idUuidHospital, placeId]);
}

// ============================================================================
// Review Operations
// ============================================================================

/**
 * Get reviews for a hospital
 */
export async function getReviews(idUuidHospital: string, limit: number = 5): Promise<HospitalGoogleReview[]> {
  const sql = `
    SELECT
      id,
      id_uuid_hospital,
      place_id,
      review_key,
      author_name,
      author_profile_url,
      author_photo_url,
      rating,
      review_text,
      publish_time,
      inserted_at,
      updated_at,
      raw
    FROM public.hospital_google_reviews
    WHERE id_uuid_hospital = $1
    ORDER BY publish_time DESC NULLS LAST
    LIMIT $2
  `;

  return await q<HospitalGoogleReview>(sql, [idUuidHospital, limit]);
}

/**
 * Generate review_key from author URL and publish time
 */
export function generateReviewKey(authorUri: string | null, publishTime: string | null): string {
  const content = `${authorUri ?? ''}|${publishTime ?? ''}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Upsert a single review
 */
export async function upsertReview(params: {
  idUuidHospital: string;
  placeId: string;
  reviewKey: string;
  authorName: string | null;
  authorProfileUrl: string | null;
  authorPhotoUrl: string | null;
  rating: number | null;
  reviewText: string | null;
  publishTime: string | null;
  raw?: any;
}): Promise<void> {
  const {
    idUuidHospital,
    placeId,
    reviewKey,
    authorName,
    authorProfileUrl,
    authorPhotoUrl,
    rating,
    reviewText,
    publishTime,
    raw,
  } = params;

  const sql = `
    INSERT INTO public.hospital_google_reviews (
      id_uuid_hospital,
      place_id,
      review_key,
      author_name,
      author_profile_url,
      author_photo_url,
      rating,
      review_text,
      publish_time,
      raw,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
    ON CONFLICT (id_uuid_hospital, review_key)
    DO UPDATE SET
      author_name = EXCLUDED.author_name,
      author_profile_url = EXCLUDED.author_profile_url,
      author_photo_url = EXCLUDED.author_photo_url,
      rating = EXCLUDED.rating,
      review_text = EXCLUDED.review_text,
      publish_time = EXCLUDED.publish_time,
      raw = EXCLUDED.raw,
      updated_at = now()
  `;

  await q(sql, [
    idUuidHospital,
    placeId,
    reviewKey,
    authorName,
    authorProfileUrl,
    authorPhotoUrl,
    rating,
    reviewText,
    publishTime,
    raw ? JSON.stringify(raw) : null,
  ]);
}

/**
 * Upsert multiple reviews in batch
 */
export async function upsertReviews(reviews: Array<{
  idUuidHospital: string;
  placeId: string;
  reviewKey: string;
  authorName: string | null;
  authorProfileUrl: string | null;
  authorPhotoUrl: string | null;
  rating: number | null;
  reviewText: string | null;
  publishTime: string | null;
  raw?: any;
}>): Promise<void> {
  for (const review of reviews) {
    await upsertReview(review);
  }
}
