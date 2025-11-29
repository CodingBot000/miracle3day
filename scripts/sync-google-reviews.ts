#!/usr/bin/env ts-node
/**
 * Google 리뷰 수동 동기화 스크립트
 *
 * Google Places API에서 최신 리뷰를 가져와 DB에 저장합니다.
 * 자동 동기화 비활성화 후 수동으로 리뷰를 갱신할 때 사용합니다.
 *
 * 사용법:
 *   npx ts-node scripts/sync-google-reviews.ts --ids <hospital-uuid> [<hospital-uuid>...]
 *   npx ts-node scripts/sync-google-reviews.ts --all
 *   npx ts-node scripts/sync-google-reviews.ts --stale-days 30
 *
 * 환경변수:
 *   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSL
 *   GOOGLE_PLACES_API_KEY - Google Places API 키
 *
 * 참고: docs/review/GOOGLE_API_DEPRECATION_AND_MULTILINGUAL_REVIEWS.md
 */

import { Pool } from 'pg';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

// .env.local 수동 로드 (override 모드)
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const result = dotenv.parse(fs.readFileSync(envPath));
  for (const key of Object.keys(result)) {
    process.env[key] = result[key];
  }
  console.log(`✅ Loaded ${Object.keys(result).length} env vars from .env.local`);
} else {
  console.warn('⚠️ .env.local not found');
}

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_PLACES_API_KEY) {
  console.error('❌ GOOGLE_PLACES_API_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

// 프로젝트와 동일한 DB 설정 사용
const password = process.env.PGPASSWORD?.replace(/^['"]|['"]$/g, '');

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

// ============================================================================
// Types
// ============================================================================

interface Hospital {
  id_uuid: string;
  name: string;
  place_id: string | null;
}

interface PlaceDetailsResponse {
  id?: string;
  rating?: number;
  userRatingCount?: number;
  reviews?: PlaceReview[];
}

interface PlaceReview {
  name?: string;
  rating?: number;
  text?: {
    text?: string;
    languageCode?: string;
  };
  originalText?: {
    text?: string;
    languageCode?: string;
  };
  publishTime?: string;
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
    uri?: string;
  };
}

interface SyncResult {
  hospitalId: string;
  hospitalName: string;
  success: boolean;
  reviewCount?: number;
  error?: string;
}

// ============================================================================
// Utilities
// ============================================================================

function generateReviewKey(authorUri: string | undefined, publishTime: string | undefined): string {
  const input = `${authorUri ?? 'unknown'}|${publishTime ?? 'unknown'}`;
  return crypto.createHash('md5').update(input).digest('hex');
}

async function fetchPlaceDetails(placeId: string): Promise<PlaceDetailsResponse> {
  const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);

  const response = await fetch(url.toString(), {
    headers: {
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY!,
      // languageCode를 설정하지 않으면 원문으로 반환됨
      'X-Goog-FieldMask': [
        'id',
        'rating',
        'userRatingCount',
        'reviews.name',
        'reviews.rating',
        'reviews.text',
        'reviews.originalText',
        'reviews.publishTime',
        'reviews.authorAttribution',
      ].join(','),
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Places API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

// ============================================================================
// Database Operations
// ============================================================================

async function getHospitalsToSync(options: {
  ids?: string[];
  all?: boolean;
  staleDays?: number;
}): Promise<Hospital[]> {
  let query = `
    SELECT h.id_uuid, h.name, s.place_id
    FROM hospital h
    LEFT JOIN hospital_google_snapshot s ON h.id_uuid = s.id_uuid_hospital
    WHERE s.place_id IS NOT NULL
  `;
  const params: any[] = [];

  if (options.ids && options.ids.length > 0) {
    query += ` AND h.id_uuid = ANY($1)`;
    params.push(options.ids);
  } else if (options.staleDays) {
    query += ` AND (s.last_synced_at IS NULL OR s.last_synced_at < NOW() - INTERVAL '${options.staleDays} days')`;
  }

  query += ` ORDER BY s.last_synced_at ASC NULLS FIRST`;

  const { rows } = await pool.query(query, params);
  return rows;
}

async function upsertReviews(
  hospitalId: string,
  placeId: string,
  data: PlaceDetailsResponse
): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update snapshot
    await client.query(
      `
      UPDATE hospital_google_snapshot
      SET
        rating = $2,
        user_rating_count = $3,
        last_synced_at = NOW()
      WHERE id_uuid_hospital = $1
      `,
      [hospitalId, data.rating ?? null, data.userRatingCount ?? 0]
    );

    // Upsert reviews
    let insertedCount = 0;
    for (const review of data.reviews ?? []) {
      const reviewKey = generateReviewKey(
        review.authorAttribution?.uri,
        review.publishTime
      );

      // 원문 텍스트 결정 (originalText가 있으면 사용, 없으면 text 사용)
      const originalText = review.originalText?.text ?? review.text?.text ?? '';
      const originalLang = review.originalText?.languageCode ?? review.text?.languageCode ?? 'unknown';

      // review_text_i18n JSONB 업데이트
      // 기존 i18n 데이터를 가져와서 original 키 추가
      const existingResult = await client.query(
        `SELECT review_text_i18n FROM hospital_google_reviews WHERE review_key = $1`,
        [reviewKey]
      );

      let reviewTextI18n: Record<string, string> = {};
      if (existingResult.rows.length > 0 && existingResult.rows[0].review_text_i18n) {
        reviewTextI18n = existingResult.rows[0].review_text_i18n;
      }

      // original 키에 원문 저장
      reviewTextI18n['original'] = originalText;
      // 원문 언어 코드가 있으면 해당 언어로도 저장
      if (originalLang && originalLang !== 'unknown') {
        reviewTextI18n[originalLang] = originalText;
      }

      const result = await client.query(
        `
        INSERT INTO hospital_google_reviews (
          id_uuid_hospital,
          place_id,
          review_key,
          review_text,
          review_text_i18n,
          rating,
          publish_time,
          author_name,
          author_photo_url,
          author_profile_url,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id_uuid_hospital, review_key) DO UPDATE SET
          review_text = EXCLUDED.review_text,
          review_text_i18n = EXCLUDED.review_text_i18n,
          rating = EXCLUDED.rating,
          updated_at = NOW()
        RETURNING id
        `,
        [
          hospitalId,
          placeId,
          reviewKey,
          originalText,
          JSON.stringify(reviewTextI18n),
          review.rating ?? null,
          review.publishTime ?? null,
          review.authorAttribution?.displayName ?? null,
          review.authorAttribution?.photoUri ?? null,
          review.authorAttribution?.uri ?? null,
        ]
      );

      if (result.rows.length > 0) {
        insertedCount++;
      }
    }

    await client.query('COMMIT');
    return insertedCount;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================================
// Main Sync Function
// ============================================================================

async function syncHospital(hospital: Hospital): Promise<SyncResult> {
  const { id_uuid, name, place_id } = hospital;

  if (!place_id) {
    return {
      hospitalId: id_uuid,
      hospitalName: name,
      success: false,
      error: 'No place_id (place_id) found',
    };
  }

  try {
    console.log(`  🔄 Syncing: ${name} (${id_uuid})`);

    const placeDetails = await fetchPlaceDetails(place_id);
    const reviewCount = await upsertReviews(id_uuid, place_id, placeDetails);

    console.log(`  ✅ Synced ${reviewCount} reviews for ${name}`);

    return {
      hospitalId: id_uuid,
      hospitalName: name,
      success: true,
      reviewCount,
    };
  } catch (error: any) {
    console.error(`  ❌ Failed to sync ${name}: ${error.message}`);
    return {
      hospitalId: id_uuid,
      hospitalName: name,
      success: false,
      error: error.message,
    };
  }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let ids: string[] | undefined;
  let all = false;
  let staleDays: number | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ids') {
      ids = [];
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        ids.push(args[i]);
        i++;
      }
      i--; // Step back for outer loop
    } else if (args[i] === '--all') {
      all = true;
    } else if (args[i] === '--stale-days') {
      staleDays = parseInt(args[++i], 10);
    }
  }

  if (!ids && !all && !staleDays) {
    console.log(`
Google Reviews 수동 동기화 스크립트

사용법:
  npx ts-node scripts/sync-google-reviews.ts --ids <uuid> [<uuid>...]
  npx ts-node scripts/sync-google-reviews.ts --all
  npx ts-node scripts/sync-google-reviews.ts --stale-days <days>

옵션:
  --ids <uuid>...     특정 병원 UUID들 동기화
  --all               모든 병원 동기화
  --stale-days <n>    n일 이상 동기화되지 않은 병원만

예시:
  npx ts-node scripts/sync-google-reviews.ts --ids abc-123 def-456
  npx ts-node scripts/sync-google-reviews.ts --stale-days 30
    `);
    process.exit(0);
  }

  console.log('🚀 Google Reviews 동기화 시작\n');

  try {
    const hospitals = await getHospitalsToSync({ ids, all, staleDays });
    console.log(`📋 동기화 대상: ${hospitals.length}개 병원\n`);

    const results: SyncResult[] = [];

    for (const hospital of hospitals) {
      const result = await syncHospital(hospital);
      results.push(result);

      // Rate limiting: 1 request per second
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n📊 동기화 결과 요약');
    console.log('─'.repeat(50));

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`✅ 성공: ${successful.length}개 병원`);
    console.log(`❌ 실패: ${failed.length}개 병원`);

    if (failed.length > 0) {
      console.log('\n실패 목록:');
      for (const f of failed) {
        console.log(`  - ${f.hospitalName}: ${f.error}`);
      }
    }

    const totalReviews = successful.reduce((sum, r) => sum + (r.reviewCount ?? 0), 0);
    console.log(`\n📝 총 동기화된 리뷰: ${totalReviews}개`);
  } catch (error: any) {
    console.error('❌ 동기화 중 오류 발생:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
