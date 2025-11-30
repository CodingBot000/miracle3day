/**
 * ⚠️ DEPRECATED - POST /api/hospital/[id]/google-reviews/sync
 *
 * 자동 동기화가 비활성화되었습니다.
 * 리뷰 동기화가 필요한 경우 수동 스크립트를 사용하세요:
 *   npx ts-node scripts/sync-google-reviews.ts --ids <hospital-uuid>
 *
 * 참고: docs/review/GOOGLE_API_DEPRECATION_AND_MULTILINGUAL_REVIEWS.md
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const idUuidHospital = params.id;

  console.warn(
    `[POST /api/hospital/${idUuidHospital}/google-reviews/sync] ` +
    `⚠️ DEPRECATED: Auto sync is disabled. Use manual script instead.`
  );

  return NextResponse.json(
    {
      error: 'Auto sync is disabled',
      message: 'Google API 비용 절감을 위해 자동 동기화가 비활성화되었습니다.',
      suggestion: `수동 스크립트를 사용하세요: npx ts-node scripts/sync-google-reviews.ts --ids ${idUuidHospital}`,
      docs: 'docs/review/GOOGLE_API_DEPRECATION_AND_MULTILINGUAL_REVIEWS.md',
    },
    { status: 410 } // 410 Gone - 리소스가 더 이상 사용 불가
  );
}
