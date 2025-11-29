/**
 * 기존 리뷰 원문 갱신 스크립트
 * - 현재 DB에는 한국어 번역본이 저장되어 있음
 * - Places API를 languageCode 없이 호출하여 원문을 받아옴
 * - 기존 review_text_i18n에 'original' 키로 추가
 *
 * 실행 방법:
 *   npx ts-node scripts/refresh-original-reviews.ts --all
 *   npx ts-node scripts/refresh-original-reviews.ts --ids <uuid1> <uuid2>
 *
 * 환경변수 필요:
 *   GOOGLE_PLACES_API_KEY
 *   DATABASE_URL
 */

import { Pool } from 'pg';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// .env.local 수동 로드 (override 모드)
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const result = dotenv.parse(fs.readFileSync(envPath));
  for (const key of Object.keys(result)) {
    // 기존 값이 있어도 덮어쓰기 (override)
    process.env[key] = result[key];
  }
  console.log(`✅ Loaded ${Object.keys(result).length} env vars from .env.local`);
} else {
  console.warn('⚠️ .env.local not found');
}

// 프로젝트와 동일한 DB 설정 사용
const password = process.env.PGPASSWORD?.replace(/^['"]|['"]$/g, '');

// DB 연결 정보 확인 (민감정보 제외)
console.log('DB Config:', {
  host: process.env.PGHOST?.substring(0, 20) + '...',
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  ssl: process.env.PGSSL,
});

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

if (!GOOGLE_PLACES_API_KEY) {
  console.error('❌ GOOGLE_PLACES_API_KEY is not set');
  process.exit(1);
}

/**
 * review_key 생성 (기존 데이터와 매칭용)
 */
function generateReviewKey(authorUri: string | undefined, publishTime: string | undefined): string {
  const input = `${authorUri ?? ''}|${publishTime ?? ''}`;
  return crypto.createHash('md5').update(input).digest('hex');
}

/**
 * Place Details 조회 (원문으로 - languageCode 없이)
 */
async function fetchPlaceDetailsOriginal(placeId: string) {
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          // languageCode 없음 → 원문으로 반환
          'X-Goog-FieldMask': 'id,rating,userRatingCount,reviews',
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Place details fetch failed:', error);
    return null;
  }
}

/**
 * 원문 리뷰를 기존 레코드에 업데이트 (review_key 매칭)
 */
async function updateOriginalReview(
  hospitalId: string,
  reviewKey: string,
  originalText: string
) {
  // review_text_i18n에 'original' 키 추가 (기존 'ko' 유지)
  await pool.query(
    `UPDATE public.hospital_google_reviews
     SET review_text_i18n = COALESCE(review_text_i18n, '{}'::jsonb) || jsonb_build_object('original', $1::text),
         updated_at = now()
     WHERE id_uuid_hospital = $2 AND review_key = $3`,
    [originalText, hospitalId, reviewKey]
  );
}

/**
 * 새 리뷰 삽입 (기존에 없는 경우)
 */
async function insertNewReview(
  hospitalId: string,
  placeId: string,
  review: any
) {
  const reviewKey = generateReviewKey(
    review.authorAttribution?.uri,
    review.publishTime
  );

  const reviewTextI18n = {
    original: review.text?.text || review.originalText?.text || '',
  };

  await pool.query(
    `INSERT INTO public.hospital_google_reviews
       (id_uuid_hospital, place_id, review_key, author_name, author_profile_url,
        author_photo_url, rating, review_text_i18n, publish_time, raw)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10::jsonb)
     ON CONFLICT (id_uuid_hospital, review_key) DO NOTHING`,
    [
      hospitalId,
      placeId,
      reviewKey,
      review.authorAttribution?.displayName || null,
      review.authorAttribution?.uri || null,
      review.authorAttribution?.photoUri || null,
      review.rating || null,
      JSON.stringify(reviewTextI18n),
      review.publishTime || null,
      JSON.stringify(review),
    ]
  );
}

/**
 * 단일 병원 원문 갱신
 */
async function refreshHospitalOriginal(hospitalId: string): Promise<{ updated: number; inserted: number }> {
  console.log(`\n🏥 Processing hospital: ${hospitalId}`);

  // 1. 기존 place_id 조회
  const snapshotResult = await pool.query(
    `SELECT place_id FROM public.hospital_google_snapshot WHERE id_uuid_hospital = $1`,
    [hospitalId]
  );

  const placeId = snapshotResult.rows[0]?.place_id;
  if (!placeId) {
    console.log('  ⚠️ No place_id found - skipping');
    return { updated: 0, inserted: 0 };
  }

  // 2. 기존 리뷰 review_key 목록 조회
  const existingReviewsResult = await pool.query(
    `SELECT review_key FROM public.hospital_google_reviews WHERE id_uuid_hospital = $1`,
    [hospitalId]
  );
  const existingKeys = new Set(existingReviewsResult.rows.map(r => r.review_key));
  console.log(`  📋 Existing reviews: ${existingKeys.size}`);

  // 3. Places API에서 원문 조회 (languageCode 없이)
  console.log('  📥 Fetching original reviews from Places API...');
  const placeDetails = await fetchPlaceDetailsOriginal(placeId);

  if (!placeDetails) {
    console.log('  ❌ Failed to fetch place details');
    return { updated: 0, inserted: 0 };
  }

  const reviews = placeDetails.reviews || [];
  console.log(`  📝 Received ${reviews.length} reviews from API`);

  let updated = 0;
  let inserted = 0;

  // 4. 각 리뷰 처리
  for (const review of reviews) {
    const reviewKey = generateReviewKey(
      review.authorAttribution?.uri,
      review.publishTime
    );
    const originalText = review.text?.text || review.originalText?.text || '';

    if (existingKeys.has(reviewKey)) {
      // 기존 리뷰: original 키 업데이트
      await updateOriginalReview(hospitalId, reviewKey, originalText);
      updated++;
      console.log(`    ✏️ Updated: ${reviewKey.substring(0, 8)}...`);
    } else {
      // 새 리뷰: 삽입
      await insertNewReview(hospitalId, placeId, review);
      inserted++;
      console.log(`    ➕ Inserted: ${reviewKey.substring(0, 8)}...`);
    }
  }

  console.log(`  ✅ Completed: ${updated} updated, ${inserted} inserted`);
  return { updated, inserted };
}

/**
 * 전체 병원 원문 갱신
 */
async function refreshAllOriginal() {
  console.log('🚀 Starting original review refresh for all hospitals...\n');

  // place_id가 있는 병원만 대상
  const result = await pool.query(
    `SELECT s.id_uuid_hospital
     FROM public.hospital_google_snapshot s
     WHERE s.place_id IS NOT NULL`
  );

  const hospitals = result.rows;
  console.log(`📋 Found ${hospitals.length} hospitals with place_id\n`);

  let totalUpdated = 0;
  let totalInserted = 0;
  let failed = 0;

  for (const hospital of hospitals) {
    try {
      const { updated, inserted } = await refreshHospitalOriginal(hospital.id_uuid_hospital);
      totalUpdated += updated;
      totalInserted += inserted;

      // Rate limiting: 1.5초 대기 (API 쿼터 보호)
      await new Promise(r => setTimeout(r, 1500));
    } catch (error) {
      console.error(`  ❌ Error: ${error}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Completed: ${totalUpdated} updated, ${totalInserted} inserted, ${failed} failed`);
}

/**
 * 선택적 병원 원문 갱신
 */
async function refreshSelectedOriginal(hospitalIds: string[]) {
  console.log(`🚀 Refreshing original reviews for ${hospitalIds.length} hospitals...\n`);

  let totalUpdated = 0;
  let totalInserted = 0;
  let failed = 0;

  for (const hospitalId of hospitalIds) {
    try {
      const { updated, inserted } = await refreshHospitalOriginal(hospitalId);
      totalUpdated += updated;
      totalInserted += inserted;

      await new Promise(r => setTimeout(r, 1500));
    } catch (error) {
      console.error(`❌ Error for ${hospitalId}: ${error}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Completed: ${totalUpdated} updated, ${totalInserted} inserted, ${failed} failed`);
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--all')) {
    await refreshAllOriginal();
  } else if (args.includes('--ids')) {
    const idsIndex = args.indexOf('--ids');
    const hospitalIds = args.slice(idsIndex + 1).filter(id => !id.startsWith('--'));

    if (hospitalIds.length === 0) {
      console.log('Usage: npx ts-node scripts/refresh-original-reviews.ts --ids <id1> <id2> ...');
      process.exit(1);
    }

    await refreshSelectedOriginal(hospitalIds);
  } else {
    console.log(`
Original Reviews Refresh Script
================================
기존에 한국어로 저장된 리뷰에 원문을 추가합니다.

Usage:
  npx ts-node scripts/refresh-original-reviews.ts --all
    → 모든 병원 리뷰 원문 갱신

  npx ts-node scripts/refresh-original-reviews.ts --ids <uuid1> <uuid2> ...
    → 지정한 병원들만 원문 갱신

결과:
  - 기존 리뷰: review_text_i18n에 'original' 키 추가 (기존 'ko' 유지)
  - 새 리뷰: 'original' 키로 새로 삽입

Environment Variables Required:
  GOOGLE_PLACES_API_KEY
  DATABASE_URL
`);
  }

  await pool.end();
}

main().catch(console.error);
