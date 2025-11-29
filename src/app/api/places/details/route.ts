/**
 * GET /api/places/details
 * Google Places API에서 장소 상세 정보 조회 (지도용)
 *
 * ⚠️ 리뷰 조회는 더 이상 이 API를 사용하지 않습니다.
 * 리뷰는 DB에 캐싱된 데이터를 사용합니다: GET /api/hospital/[id]/google-reviews
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const placeId = req.nextUrl.searchParams.get('placeId');
    const languageCode = req.nextUrl.searchParams.get('lang') || 'ko';

    if (!placeId) {
      return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
    }

    // v1 Details 호출 (지도 표시용 기본 정보만)
    const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
    url.searchParams.set('languageCode', languageCode);

    const r = await fetch(url.toString(), {
      headers: {
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
        'X-Goog-FieldMask': [
          'id',
          'displayName',
          'formattedAddress',
          'rating',
          'userRatingCount',
          'location',
          'googleMapsUri',
        ].join(',')
      }
    });

    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: data }, { status: r.status });
    }

    return NextResponse.json(
      {
        id: data.id ?? null,
        name: data.displayName?.text ?? null,
        address: data.formattedAddress ?? null,
        rating: data.rating ?? null,
        userRatingCount: data.userRatingCount ?? 0,
        location: data.location ?? null,
        googleMapsUri: data.googleMapsUri ?? null,
      },
      { headers: { 'Cache-Control': 'public, max-age=3600' } } // 1시간 캐시
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}
