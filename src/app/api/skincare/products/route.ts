/**
 * 스킨케어 제품 목록 API
 *
 * GET /api/skincare/products - 제품 목록 조회 (필터링, 검색, 페이징)
 * - 인증 불필요 (공개 데이터)
 *
 * Query Parameters:
 * - filter_type: 'category' | 'skin_concern' | 'age' (기본값: category)
 * - main_category: 대분류 필터 (filter_type=category일 때)
 * - sub_category: 세부분류 필터 = category1 (filter_type=category일 때)
 * - theme_name: 피부고민/연령대 필터 (filter_type=skin_concern 또는 age일 때)
 * - search: 검색어
 * - page, limit: 페이징
 */

import { NextRequest, NextResponse } from 'next/server';
import { q, one } from '@/lib/db';

export const runtime = 'nodejs';

interface ProductRow {
  id: number;
  product_name: string;
  brand_name: string;
  price_krw: number | null;
  volume_text: string | null;
  image_url: string | null;
  avg_rating: number | null;
  review_count: number | null;
  main_category: string | null;
  category1: string | null;
  category2: string | null;
  rank: number | null;
  theme_name: string | null;
}

type FilterType = 'category' | 'skin_concern' | 'age';

/**
 * 제품 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 추출
    const filterType = (searchParams.get('filter_type') || 'category') as FilterType;
    const mainCategory = searchParams.get('main_category') || null;
    const subCategory = searchParams.get('sub_category') || null;
    const themeName = searchParams.get('theme_name') || null;
    const search = searchParams.get('search') || null;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    let products: ProductRow[] = [];
    let total = 0;

    if (filterType === 'category') {
      // 카테고리 필터 (main_category + category1)
      const result = await queryByCategory(mainCategory, subCategory, search, limit, offset);
      products = result.products;
      total = result.total;
    } else if (filterType === 'skin_concern') {
      // 피부고민 필터 (product_rankings source='ingredients')
      const result = await queryByRanking('ingredients', themeName, search, limit, offset);
      products = result.products;
      total = result.total;
    } else if (filterType === 'age') {
      // 연령대 필터 (product_rankings source='age')
      const result = await queryByRanking('age', themeName, search, limit, offset);
      products = result.products;
      total = result.total;
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('제품 목록 조회 오류:', error);
    const message = error instanceof Error ? error.message : '조회 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

/**
 * 카테고리 필터로 제품 조회 (main_category + category1)
 */
async function queryByCategory(
  mainCategory: string | null,
  subCategory: string | null,
  search: string | null,
  limit: number,
  offset: number
): Promise<{ products: ProductRow[]; total: number }> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (mainCategory) {
    conditions.push(`pc.main_category = $${paramIndex}`);
    params.push(mainCategory);
    paramIndex++;
  }

  if (subCategory) {
    conditions.push(`pc.category1 = $${paramIndex}`);
    params.push(subCategory);
    paramIndex++;
  }

  if (search) {
    conditions.push(`(
      pm.product_name ILIKE '%' || $${paramIndex} || '%' OR
      pm.brand_name ILIKE '%' || $${paramIndex} || '%' OR
      EXISTS (
        SELECT 1 FROM product_ingredients pi
        WHERE pi.product_master_id = pm.id
        AND (
          pi.matched_ingredients_ko::text ILIKE '%' || $${paramIndex} || '%' OR
          pi.matched_ingredients_en::text ILIKE '%' || $${paramIndex} || '%'
        )
      )
    )`);
    params.push(search);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 제품 조회
  const productsQuery = `
    SELECT DISTINCT ON (pm.id)
      pm.id,
      pm.product_name,
      pm.brand_name,
      pm.price_krw,
      pm.volume_text,
      pm.image_url,
      pm.avg_rating,
      pm.review_count,
      pc.main_category,
      pc.category1,
      pc.category2,
      NULL::int as rank,
      NULL::text as theme_name
    FROM products_master pm
    LEFT JOIN product_categories pc ON pm.id = pc.product_master_id
    ${whereClause}
    ORDER BY pm.id, pm.review_count DESC NULLS LAST
  `;

  // 전체 개수 조회
  const countQuery = `
    SELECT COUNT(DISTINCT pm.id)::int as total
    FROM products_master pm
    LEFT JOIN product_categories pc ON pm.id = pc.product_master_id
    ${whereClause}
  `;

  const countParams = [...params];
  params.push(limit, offset);

  // 최종 쿼리 (정렬 + 페이징)
  const finalQuery = `
    SELECT * FROM (${productsQuery}) sub
    ORDER BY review_count DESC NULLS LAST, id
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const [products, countResult] = await Promise.all([
    q<ProductRow>(finalQuery, params),
    one<{ total: number }>(countQuery, countParams),
  ]);

  return {
    products,
    total: countResult?.total || 0,
  };
}

/**
 * 랭킹 기반 필터로 제품 조회 (피부고민, 연령대)
 */
async function queryByRanking(
  source: 'ingredients' | 'age',
  themeName: string | null,
  search: string | null,
  limit: number,
  offset: number
): Promise<{ products: ProductRow[]; total: number }> {
  const conditions: string[] = [`r.source = $1`];
  const params: (string | number)[] = [source];
  let paramIndex = 2;

  if (themeName) {
    conditions.push(`r.theme_name = $${paramIndex}`);
    params.push(themeName);
    paramIndex++;
  }

  if (search) {
    conditions.push(`(
      pm.product_name ILIKE '%' || $${paramIndex} || '%' OR
      pm.brand_name ILIKE '%' || $${paramIndex} || '%' OR
      EXISTS (
        SELECT 1 FROM product_ingredients pi
        WHERE pi.product_master_id = pm.id
        AND (
          pi.matched_ingredients_ko::text ILIKE '%' || $${paramIndex} || '%' OR
          pi.matched_ingredients_en::text ILIKE '%' || $${paramIndex} || '%'
        )
      )
    )`);
    params.push(search);
    paramIndex++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // 제품 조회 (랭킹 순 정렬)
  const productsQuery = `
    SELECT DISTINCT ON (pm.id)
      pm.id,
      pm.product_name,
      pm.brand_name,
      pm.price_krw,
      pm.volume_text,
      pm.image_url,
      pm.avg_rating,
      pm.review_count,
      pc.main_category,
      pc.category1,
      pc.category2,
      r.rank,
      r.theme_name
    FROM products_master pm
    INNER JOIN product_rankings r ON pm.id = r.product_master_id
    LEFT JOIN product_categories pc ON pm.id = pc.product_master_id
    ${whereClause}
    ORDER BY pm.id, r.rank ASC
  `;

  // 전체 개수 조회
  const countQuery = `
    SELECT COUNT(DISTINCT pm.id)::int as total
    FROM products_master pm
    INNER JOIN product_rankings r ON pm.id = r.product_master_id
    ${whereClause}
  `;

  const countParams = [...params];
  params.push(limit, offset);

  // 최종 쿼리 (정렬 + 페이징)
  const finalQuery = `
    SELECT * FROM (${productsQuery}) sub
    ORDER BY rank ASC NULLS LAST, review_count DESC NULLS LAST, id
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const [products, countResult] = await Promise.all([
    q<ProductRow>(finalQuery, params),
    one<{ total: number }>(countQuery, countParams),
  ]);

  return {
    products,
    total: countResult?.total || 0,
  };
}
