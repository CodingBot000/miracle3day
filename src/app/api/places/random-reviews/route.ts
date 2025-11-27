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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 10), 1), 50); // 1~50 guard

    log.debug('[random-reviews] Fetching reviews with limit:', limit);

    // Simple ORDER BY random() approach - works everywhere
    const sql = `
      SELECT
        id,
        id_uuid_hospital,
        review_text,
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

    return NextResponse.json(
      { reviews: rows },
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
