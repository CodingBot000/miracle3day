/**
 * ⚠️ DEPRECATED - 자동 동기화 비활성화됨
 *
 * Google API 비용 절감을 위해 자동 동기화가 중단되었습니다.
 * 리뷰 동기화가 필요한 경우 수동 스크립트를 사용하세요:
 *   npx ts-node scripts/refresh-original-reviews.ts --all
 *   npx ts-node scripts/sync-google-reviews.ts --all
 *
 * 참고: docs/review/GOOGLE_API_DEPRECATION_AND_MULTILINGUAL_REVIEWS.md
 */

import { log } from '@/utils/logger';

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
// DEPRECATED Functions - Always return without calling Google API
// ============================================================================

/**
 * @deprecated 자동 동기화가 비활성화되었습니다.
 * 수동 스크립트를 사용하세요: scripts/sync-google-reviews.ts
 */
export async function syncHospitalReviews(params: {
  idUuidHospital: string;
  searchKey: string | null;
  forceSync?: boolean;
}): Promise<SyncResult> {
  const { idUuidHospital } = params;

  log.warn(
    `[syncHospitalReviews] ⚠️ DEPRECATED: Auto sync is disabled for ${idUuidHospital}. ` +
    `Use manual script: npx ts-node scripts/sync-google-reviews.ts --ids ${idUuidHospital}`
  );

  return {
    success: false,
    placeId: null,
    rating: null,
    userRatingCount: null,
    reviewsCount: 0,
    error: 'Auto sync is disabled. Use manual script instead.',
  };
}

/**
 * @deprecated 자동 동기화가 비활성화되었습니다.
 */
export async function syncMultipleHospitals(
  hospitals: Array<{ idUuidHospital: string; searchKey: string | null }>
): Promise<SyncResult[]> {
  log.warn(
    `[syncMultipleHospitals] ⚠️ DEPRECATED: Auto sync is disabled. ` +
    `Use manual script: npx ts-node scripts/sync-google-reviews.ts --all`
  );

  return hospitals.map((h) => ({
    success: false,
    placeId: null,
    rating: null,
    userRatingCount: null,
    reviewsCount: 0,
    error: 'Auto sync is disabled. Use manual script instead.',
  }));
}
