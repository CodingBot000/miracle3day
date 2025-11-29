/**
 * 여러 병원의 Google 리뷰 스냅샷(rating, reviewCount)을 한 번에 조회하는 훅
 */

import { useQuery } from '@tanstack/react-query';

export interface GoogleSnapshot {
  rating: number | null;
  userRatingCount: number | null;
}

interface SnapshotsResponse {
  snapshots: Record<string, GoogleSnapshot>;
}

/**
 * 여러 병원의 Google 리뷰 스냅샷을 bulk로 조회
 *
 * @param hospitalIds - 병원 UUID 배열
 * @param enabled - 쿼리 활성화 여부
 *
 * @example
 * ```tsx
 * const hospitalIds = hospitals.map(h => h.id_uuid);
 * const { data: snapshots } = useHospitalGoogleSnapshots(hospitalIds);
 *
 * // 사용
 * const rating = snapshots?.[hospitalId]?.rating;
 * ```
 */
export function useHospitalGoogleSnapshots(
  hospitalIds: string[],
  enabled: boolean = true
) {
  return useQuery<Record<string, GoogleSnapshot>>({
    queryKey: ['hospitalGoogleSnapshots', hospitalIds.sort().join(',')],
    queryFn: async () => {
      if (hospitalIds.length === 0) {
        return {};
      }

      const res = await fetch('/api/hospitals/google-snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalIds }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch snapshots');
      }

      const data: SnapshotsResponse = await res.json();
      return data.snapshots;
    },
    enabled: enabled && hospitalIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  });
}
