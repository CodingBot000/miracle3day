/**
 * 스킨케어 카테고리 API
 *
 * GET /api/skincare/categories - 카테고리 계층 구조 조회
 * - 인증 불필요 (공개 데이터)
 */

import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

export const runtime = 'nodejs';

interface CategoryRow {
  category1: string;
  category2: string;
  count: number;
}

interface CategoryResult {
  category1: string;
  subcategories: {
    category2: string;
    count: number;
  }[];
}

/**
 * 카테고리 목록 조회
 */
export async function GET() {
  try {
    // category1, category2별 제품 수 조회
    const rows = await q<CategoryRow>(
      `SELECT
        pc.category1,
        pc.category2,
        COUNT(DISTINCT pm.id)::int as count
      FROM product_categories pc
      INNER JOIN products_master pm ON pc.product_master_id = pm.id
      WHERE pc.category1 IS NOT NULL
        AND pc.category2 IS NOT NULL
      GROUP BY pc.category1, pc.category2
      ORDER BY pc.category1, pc.category2`
    );

    // 계층 구조로 변환
    const categoryMap = new Map<string, CategoryResult>();

    for (const row of rows) {
      if (!categoryMap.has(row.category1)) {
        categoryMap.set(row.category1, {
          category1: row.category1,
          subcategories: [],
        });
      }

      categoryMap.get(row.category1)!.subcategories.push({
        category2: row.category2,
        count: row.count,
      });
    }

    const categories = Array.from(categoryMap.values());

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    const message = error instanceof Error ? error.message : '조회 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
