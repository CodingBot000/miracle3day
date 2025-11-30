/**
 * GET /api/places/random-reviews
 * Returns random reviews from hospital_google_reviews table
 * Uses TABLESAMPLE for performance, falls back to ORDER BY random() if needed
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { log } from '@/utils/logger';

/**
 * 다국어 리뷰 텍스트 추출
 * 우선순위: 요청 언어 → en → ko → original → review_text
 */
function extractReviewText(
  reviewTextI18n: Record<string, string> | null,
  reviewText: string | null,
  lang: string
): string {
  if (reviewTextI18n && typeof reviewTextI18n === 'object') {
    if (reviewTextI18n[lang]) return reviewTextI18n[lang];
    if (reviewTextI18n['en']) return reviewTextI18n['en'];
    if (reviewTextI18n['ko']) return reviewTextI18n['ko'];
    if (reviewTextI18n['original']) return reviewTextI18n['original'];
  }
  return reviewText ?? '';
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 10), 1), 50); // 1~50 guard
    const lang = url.searchParams.get('lang') || 'en'; // 기본값: en

    log.debug('[random-reviews] Fetching reviews with limit:', limit, 'lang:', lang);

    // Simple ORDER BY random() approach - works everywhere
    const sql = `
      SELECT
        id,
        id_uuid_hospital,
        review_text,
        review_text_i18n,
        rating,
        publish_time,
        author_name,
        author_photo_url,
        author_profile_url
      FROM public.hospital_google_reviews
      WHERE review_text IS NOT NULL
        AND LENGTH(review_text) > 10
      ORDER BY random()
      LIMIT $1
    `;

    const { rows } = await pool.query(sql, [limit]);

    log.debug('[random-reviews] Found reviews:', rows.length);

    // 다국어 리뷰 텍스트 처리
    const processedReviews = rows.map((row: any) => ({
      id: row.id,
      id_uuid_hospital: row.id_uuid_hospital,
      review_text: extractReviewText(row.review_text_i18n, row.review_text, lang),
      rating: row.rating,
      publish_time: row.publish_time,
      author_name: row.author_name,
      author_photo_url: row.author_photo_url,
      author_profile_url: row.author_profile_url,
    }));

    return NextResponse.json(
      { reviews: processedReviews },
      {
        headers: {
          // 5 minute cache
          'Cache-Control': 'public, max-age=300',
        },
      }
    );
  } catch (e: any) {
    console.error('[GET /api/places/random-reviews] Error:', e);
    console.error('[GET /api/places/random-reviews] Error stack:', e?.stack);
    return NextResponse.json(
      {
        error: e?.message ?? 'internal error',
        details: process.env.NODE_ENV === 'development' ? e?.stack : undefined
      },
      { status: 500 }
    );
  }
}
