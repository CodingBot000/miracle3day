// src/app/api/places/details/route.ts
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

    // v1 Details: reviewsSort 파라미터 없음(삭제)
    const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
    url.searchParams.set('languageCode', languageCode);

    const r = await fetch(url.toString(), {
      headers: {
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
        // FieldMask는 v1에서 필수. 필요한 필드만 요청
        'X-Goog-FieldMask': [
          'id',
          'displayName',
          'formattedAddress',
          'rating',
          'userRatingCount',
          'reviews',
          'reviews.rating',
          'reviews.text',
          'reviews.publishTime',
          'reviews.authorAttribution',
          'reviews.authorAttribution.displayName',
          'reviews.authorAttribution.photoUri',
          'reviews.authorAttribution.uri'
        ].join(',')
      }
    });

    const data = await r.json();

    if (!r.ok) {
      // Google 응답 그대로 래핑해 전달
      return NextResponse.json({ error: data }, { status: r.status });
    }

    // 최대 5개만 오며, 서버에서 최신순으로 정렬
    const reviews = Array.isArray(data.reviews) ? data.reviews.slice() : [];
    reviews.sort((a: any, b: any) => {
      const ta = a?.publishTime ? Date.parse(a.publishTime) : 0;
      const tb = b?.publishTime ? Date.parse(b.publishTime) : 0;
      return tb - ta; // 최신 우선
    });

    // 응답 최소화 형태로 반환
    return NextResponse.json(
      {
        id: data.id ?? null,
        name: data.displayName?.text ?? null,
        address: data.formattedAddress ?? null,
        rating: data.rating ?? null,
        userRatingCount: data.userRatingCount ?? 0,
        reviews
      },
      {
        // (선택) 60초 캐시 – 필요 없으면 제거
        headers: { 'Cache-Control': 'public, max-age=60' }
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}
