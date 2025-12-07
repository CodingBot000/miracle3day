/**
 * Hook to fetch Google reviews from database cache (DB-first approach)
 * This replaces the old direct Google API calls with cached data
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GooglePlaceReviewsResponse, ReviewDataFromGoogleMap } from '@/models/reviewData.dto';

// ============================================================================
// Types
// ============================================================================

export interface CachedGoogleReview {
  authorName: string | null;
  authorProfileUrl: string | null;
  authorPhotoUrl: string | null;
  rating: number | null;
  reviewText: string | null;
  publishTime: string | null;
}

export interface CachedGoogleReviewsResponse {
  placeId: string | null;
  rating: number | null;
  userRatingCount: number | null;
  lastSyncedAt: string | null;
  syncCadenceHours: number;
  needsSync: boolean;
  reviews: CachedGoogleReview[];
}

// ============================================================================
// Converters
// ============================================================================

/**
 * Convert cached review to Google Maps format for compatibility
 */
function convertToGoogleMapReview(cached: CachedGoogleReview): ReviewDataFromGoogleMap {
  return {
    rating: cached.rating,
    publishTime: cached.publishTime,
    authorAttribution: {
      displayName: cached.authorName ?? undefined,
      photoUri: cached.authorPhotoUrl ?? undefined,
      uri: cached.authorProfileUrl ?? undefined,
    },
    sourceLanguage: null,
    text: {
      text: cached.reviewText ?? '',
      languageCode: null,
    },
  };
}

/**
 * Convert cached response to Google Places format for compatibility
 */
function convertToGooglePlaceResponse(
  cached: CachedGoogleReviewsResponse
): GooglePlaceReviewsResponse {
  return {
    id: cached.placeId,
    name: null,
    address: null,
    rating: cached.rating,
    userRatingCount: cached.userRatingCount ?? 0,
    targetLang: 'en',
    reviews: cached.reviews.map(convertToGoogleMapReview),
  };
}

// ============================================================================
// Fetch from DB Cache
// ============================================================================

/**
 * Fetch cached Google reviews from database
 */
async function fetchCachedReviews(idUuidHospital: string): Promise<CachedGoogleReviewsResponse> {
  const response = await fetch(`/api/hospital/${idUuidHospital}/google-reviews`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cached reviews');
  }

  return await response.json();
}

/**
 * Trigger sync from Google API to database
 */
async function triggerSync(params: {
  idUuidHospital: string;
  forceSync?: boolean;
}): Promise<any> {
  const { idUuidHospital, forceSync = false } = params;

  const response = await fetch(`/api/hospital/${idUuidHospital}/google-reviews/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ forceSync }),
  });

  if (!response.ok) {
    throw new Error('Failed to trigger sync');
  }

  return await response.json();
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Main hook to fetch hospital Google reviews from DB cache
 * @param idUuidHospital - Hospital UUID
 * @param autoSync - Automatically trigger sync if data is stale (default: true)
 */
export function useHospitalGoogleReviews(
  idUuidHospital: string | null | undefined,
  options?: {
    autoSync?: boolean;
    enabled?: boolean;
  }
) {
  const queryClient = useQueryClient();
  const { autoSync = true, enabled = true } = options ?? {};

  // Query for cached data with metadata
  const query = useQuery({
    queryKey: ['hospitalGoogleReviews', idUuidHospital],
    queryFn: async () => {
      const cached = await fetchCachedReviews(idUuidHospital!);
      return {
        data: convertToGooglePlaceResponse(cached),
        metadata: {
          needsSync: cached.needsSync,
          lastSyncedAt: cached.lastSyncedAt,
        },
      };
    },
    enabled: enabled && !!idUuidHospital,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Mutation for syncing
  const syncMutation = useMutation({
    mutationFn: (forceSync: boolean = false) =>
      triggerSync({ idUuidHospital: idUuidHospital!, forceSync }),
    onSuccess: () => {
      // Invalidate cache to refetch
      queryClient.invalidateQueries({
        queryKey: ['hospitalGoogleReviews', idUuidHospital],
      });
    },
  });

  // Auto-trigger sync if data is stale
  const needsSync = query.data?.metadata.needsSync ?? false;
  const hasTriggeredSync = React.useRef(false);

  React.useEffect(() => {
    if (
      autoSync &&
      needsSync &&
      !syncMutation.isPending &&
      !hasTriggeredSync.current &&
      idUuidHospital
    ) {
      hasTriggeredSync.current = true;
      syncMutation.mutate(false);
    }
  }, [autoSync, needsSync, syncMutation, idUuidHospital]);

  return {
    ...query,
    data: query.data?.data,
    sync: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
}

/**
 * Hook to manually trigger sync
 */
export function useSyncHospitalReviews(idUuidHospital: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (forceSync: boolean = false) =>
      triggerSync({ idUuidHospital: idUuidHospital!, forceSync }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['hospitalGoogleReviews', idUuidHospital],
      });
    },
  });
}
