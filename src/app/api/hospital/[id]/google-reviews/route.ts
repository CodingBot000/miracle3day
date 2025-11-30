/**
 * GET /api/hospital/[id]/google-reviews
 * Returns cached Google reviews from database with multilingual support
 *
 * Query Parameters:
 *   - lang: 언어 코드 (en, ko, zh-CN, zh-TW, ja)
 *
 * ⚠️ Google API를 직접 호출하지 않습니다. DB 캐시만 사용합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSnapshot, getReviews } from '@/server/googleReviews/repo';

/**
 * 언어별 리뷰 텍스트 추출
 * 우선순위: 요청된 언어 → en → ko → original → 아무 값이나
 */
function extractReviewText(
  reviewTextI18n: Record<string, string> | null,
  reviewText: string | null, // legacy fallback
  lang: string,
  reviewKey?: string
): { text: string; usedLang: string } {
  // 1. review_text_i18n이 있으면 사용
  if (reviewTextI18n && typeof reviewTextI18n === 'object') {
    const availableKeys = Object.keys(reviewTextI18n);

    // 요청된 언어
    if (reviewTextI18n[lang]) {
      console.log(`[extractReviewText] reviewKey=${reviewKey}, requestedLang=${lang}, usedLang=${lang}, availableKeys=[${availableKeys.join(',')}], hasText=true`);
      return { text: reviewTextI18n[lang], usedLang: lang };
    }
    // 영어 폴백
    if (reviewTextI18n['en']) {
      console.log(`[extractReviewText] reviewKey=${reviewKey}, requestedLang=${lang}, usedLang=en (fallback), availableKeys=[${availableKeys.join(',')}], hasText=true`);
      return { text: reviewTextI18n['en'], usedLang: 'en' };
    }
    // 한국어 폴백
    if (reviewTextI18n['ko']) {
      console.log(`[extractReviewText] reviewKey=${reviewKey}, requestedLang=${lang}, usedLang=ko (fallback), availableKeys=[${availableKeys.join(',')}], hasText=true`);
      return { text: reviewTextI18n['ko'], usedLang: 'ko' };
    }
    // 원본
    if (reviewTextI18n['original']) {
      console.log(`[extractReviewText] reviewKey=${reviewKey}, requestedLang=${lang}, usedLang=original (fallback), availableKeys=[${availableKeys.join(',')}], hasText=true`);
      return { text: reviewTextI18n['original'], usedLang: 'original' };
    }
    // 아무 값이나
    if (availableKeys.length > 0) {
      const firstKey = availableKeys[0];
      console.log(`[extractReviewText] reviewKey=${reviewKey}, requestedLang=${lang}, usedLang=${firstKey} (any), availableKeys=[${availableKeys.join(',')}], hasText=true`);
      return { text: reviewTextI18n[firstKey], usedLang: firstKey };
    }

    console.log(`[extractReviewText] reviewKey=${reviewKey}, requestedLang=${lang}, usedLang=none, availableKeys=[], hasText=false`);
  } else {
    console.log(`[extractReviewText] reviewKey=${reviewKey}, requestedLang=${lang}, usedLang=legacy, i18n=null, hasText=${!!reviewText}`);
  }

  // 2. legacy review_text 폴백
  return { text: reviewText ?? '', usedLang: 'legacy' };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idUuidHospital = params.id;
    const lang = request.nextUrl.searchParams.get('lang') || 'en';

    if (!idUuidHospital) {
      return NextResponse.json(
        { error: 'Hospital ID is required' },
        { status: 400 }
      );
    }

    // Get cached snapshot
    const snapshot = await getSnapshot(idUuidHospital);

    // Get cached reviews (최대 10개)
    const reviews = await getReviews(idUuidHospital, 10);

    console.log(`[GET /api/hospital/[id]/google-reviews] hospitalId=${idUuidHospital}, lang=${lang}, reviewCount=${reviews.length}`);

    // Format response with multilingual support
    const response = {
      placeId: snapshot?.place_id ?? null,
      rating: snapshot?.rating ?? null,
      userRatingCount: snapshot?.user_rating_count ?? null,
      lastSyncedAt: snapshot?.last_synced_at ?? null,
      reviews: reviews.map((review) => {
        const extracted = extractReviewText(review.review_text_i18n, review.review_text, lang, review.review_key);
        return {
          reviewKey: review.review_key,
          authorName: review.author_name,
          authorProfileUrl: review.author_profile_url,
          authorPhotoUrl: review.author_photo_url,
          rating: review.rating,
          reviewText: extracted.text,
          publishTime: review.publish_time,
        };
      }),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300', // 5분 캐시
      },
    });
  } catch (error) {
    console.error('[GET /api/hospital/[id]/google-reviews] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cached reviews' },
      { status: 500 }
    );
  }
}
