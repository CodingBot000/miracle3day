/**
 * 스킨케어 필터 옵션 API
 *
 * GET /api/skincare/filters - 필터 옵션 목록 (카테고리, 피부고민, 연령대)
 * - 인증 불필요 (공개 데이터)
 *
 * 카테고리 구조:
 * - main_category (대분류): Skincare, Cleansers/Exfoliators, Face Makeup...
 * - category1 (세부분류): Toners, Cleansing Foam, Foundation...
 */

import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const runtime = 'nodejs';

// 대분류 한글 라벨 매핑 (main_category)
const MAIN_CATEGORY_LABELS: Record<string, string> = {
  'Skincare': '스킨케어',
  'Cleansers/Exfoliators': '클렌저/각질제거',
  'Facial Masks': '페이셜 마스크',
  'Suncare': '선케어',
  'Face Makeup': '페이스 메이크업',
  'Eye Makeup': '아이 메이크업',
  'Lip Makeup': '립 메이크업',
  'Body': '바디',
  'Hair': '헤어',
  'Nail': '네일',
  'Fragrance': '향수',
  'Supplements': '건강보조식품',
  'Baby & Mom': '베이비&맘',
  'Men': '남성',
  'Others': '기타',
};

// 피부고민 한글 라벨 매핑
const SKIN_CONCERN_LABELS: Record<string, string> = {
  'Hydration': '수분',
  'Dry Skin': '건성피부',
  'Oily Skin': '지성피부',
  'Sensitive Skin': '민감성',
  'Brightening': '미백/브라이트닝',
  'Slow Aging': '안티에이징',
  'Acne Care': '트러블케어',
  'Soothing Care': '진정케어',
  'Exfoliation': '각질케어',
  'Skin Barrier Repair': '장벽강화',
  'Mineral / Non-Chemical Sunscreen': '무기자차',
};

// 연령대 한글 라벨 매핑
const AGE_GROUP_LABELS: Record<string, string> = {
  '10s': '10대',
  '20s': '20대',
  '30s': '30대',
  '40s+': '40대+',
};

interface CategoryRow {
  main_category: string;
  category1: string;
  count: number;
}

interface MainCategoryRow {
  main_category: string;
  count: number;
}

interface RankingRow {
  theme_name: string;
  count: number;
}

interface SubCategory {
  value: string;
  label_ko: string;
  count: number;
}

interface CategoryData {
  label_ko: string;
  count: number;
  subcategories: SubCategory[];
}

export async function GET() {
  try {
    // 1. 대분류(main_category) 목록 조회
    const mainCategoryRows = await q<MainCategoryRow>(
      `SELECT
        main_category,
        COUNT(DISTINCT product_master_id)::int as count
      FROM product_categories
      WHERE main_category IS NOT NULL
      GROUP BY main_category
      ORDER BY count DESC`
    );

    // 2. 대분류별 세부분류(category1) 목록 조회
    const subCategoryRows = await q<CategoryRow>(
      `SELECT
        main_category,
        category1,
        COUNT(DISTINCT product_master_id)::int as count
      FROM product_categories
      WHERE main_category IS NOT NULL
        AND category1 IS NOT NULL
      GROUP BY main_category, category1
      ORDER BY main_category, count DESC`
    );

    // 카테고리 구조화
    const categories: Record<string, CategoryData> = {};

    // 먼저 대분류 초기화
    for (const row of mainCategoryRows) {
      categories[row.main_category] = {
        label_ko: MAIN_CATEGORY_LABELS[row.main_category] || row.main_category,
        count: row.count,
        subcategories: [],
      };
    }

    // 세부분류 추가
    for (const row of subCategoryRows) {
      if (categories[row.main_category]) {
        categories[row.main_category].subcategories.push({
          value: row.category1,
          label_ko: row.category1, // 세부분류는 영문 그대로
          count: row.count,
        });
      }
    }

    // 3. 피부고민 목록 조회 (source='ingredients')
    const skinConcernRows = await q<RankingRow>(
      `SELECT
        theme_name,
        COUNT(DISTINCT product_master_id)::int as count
      FROM product_rankings
      WHERE source = 'ingredients'
        AND theme_name IS NOT NULL
      GROUP BY theme_name
      ORDER BY theme_name`
    );

    const skinConcerns = skinConcernRows.map((row) => ({
      value: row.theme_name,
      label_ko: SKIN_CONCERN_LABELS[row.theme_name] || row.theme_name,
      count: row.count,
    }));

    // 4. 연령대 목록 조회 (source='age')
    const ageGroupRows = await q<RankingRow>(
      `SELECT
        theme_name,
        COUNT(DISTINCT product_master_id)::int as count
      FROM product_rankings
      WHERE source = 'age'
        AND theme_name IS NOT NULL
      GROUP BY theme_name
      ORDER BY
        CASE theme_name
          WHEN '10s' THEN 1
          WHEN '20s' THEN 2
          WHEN '30s' THEN 3
          WHEN '40s+' THEN 4
          ELSE 5
        END`
    );

    const ageGroups = ageGroupRows.map((row) => ({
      value: row.theme_name,
      label_ko: AGE_GROUP_LABELS[row.theme_name] || row.theme_name,
      count: row.count,
    }));

    return NextResponse.json({
      success: true,
      categories,
      skin_concerns: skinConcerns,
      age_groups: ageGroups,
    });
  } catch (error) {
    console.error('필터 옵션 조회 오류:', error);
    const message = error instanceof Error ? error.message : '조회 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
