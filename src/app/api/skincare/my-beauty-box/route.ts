/**
 * My Beauty Box API
 *
 * GET /api/skincare/my-beauty-box - 사용자의 저장된 제품 조회
 * POST /api/skincare/my-beauty-box - 제품 일괄 추가
 * - 인증 필요 (JWT 토큰)
 */

import { NextRequest, NextResponse } from 'next/server';
import { q, one } from '@/lib/db';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

interface BeautyBoxItem {
  id: number;
  product_id: number;
  product_name: string;
  brand_name: string;
  price_krw: number | null;
  image_url: string | null;
  volume_text: string | null;
  avg_rating: number | null;
  review_count: number | null;
  added_at: string;
}

/**
 * 인증 검사 공통 함수
 */
async function authenticateUser(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized - Please login first' },
      { status: 401 }
    );
  }

  const payload = await verifyAccessToken(token);

  if (!payload || payload.status !== 'active') {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  return { userId: payload.sub };
}

/**
 * 사용자의 My Beauty Box 조회
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = authResult;

    const items = await q<BeautyBoxItem>(
      `SELECT
        bb.id,
        bb.product_id,
        pm.product_name,
        pm.brand_name,
        pm.price_krw,
        pm.image_url,
        pm.volume_text,
        pm.avg_rating,
        pm.review_count,
        bb.added_at
      FROM product_my_beauty_box bb
      INNER JOIN products_master pm ON bb.product_id = pm.id
      WHERE bb.id_uuid_member = $1
      ORDER BY bb.added_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
    });
  } catch (error) {
    console.error('My Beauty Box 조회 오류:', error);
    const message = error instanceof Error ? error.message : '조회 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

/**
 * My Beauty Box에 제품 일괄 추가
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = authResult;
    const body = await request.json();
    const { product_ids } = body as { product_ids: number[] };

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'product_ids 배열이 필요합니다' },
        { status: 400 }
      );
    }

    // 제한: 한 번에 최대 50개
    if (product_ids.length > 50) {
      return NextResponse.json(
        { success: false, message: '한 번에 최대 50개까지 추가할 수 있습니다' },
        { status: 400 }
      );
    }

    // 일괄 INSERT (중복은 무시)
    let added = 0;
    let duplicates = 0;

    for (const productId of product_ids) {
      const result = await one<{ id: number }>(
        `INSERT INTO product_my_beauty_box (id_uuid_member, product_id, added_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (id_uuid_member, product_id) DO NOTHING
         RETURNING id`,
        [userId, productId]
      );

      if (result) {
        added++;
      } else {
        duplicates++;
      }
    }

    return NextResponse.json({
      success: true,
      added,
      duplicates,
      message: `${added}개 제품이 추가되었습니다${duplicates > 0 ? ` (${duplicates}개 중복)` : ''}`,
    });
  } catch (error) {
    console.error('My Beauty Box 추가 오류:', error);
    const message = error instanceof Error ? error.message : '추가 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
