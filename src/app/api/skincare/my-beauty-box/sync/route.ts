/**
 * My Beauty Box Sync API
 *
 * POST /api/skincare/my-beauty-box/sync - 변경사항 일괄 동기화
 */

import { NextRequest, NextResponse } from 'next/server';
import { q, one } from '@/lib/db';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  recordId: number;
  productId?: number;
  changes?: Record<string, unknown>;
  timestamp: string;
}

interface BeautyBoxItem {
  id: number;
  product_id: number;
  product_name: string;
  brand_name: string;
  price_krw: number | null;
  image_url: string | null;
  volume_text: string | null;
  category2: string | null;
  avg_rating: number | null;
  review_count: number | null;
  added_at: string;
  status: 'wishlist' | 'owned' | 'in_use' | 'used';
  memo: string | null;
  my_category: string | null;
  opened_at: string | null;
  expiry_date: string | null;
  use_by_date: string | null;
  finished_at: string | null;
}

// 허용된 업데이트 필드
const ALLOWED_UPDATE_FIELDS = [
  'status',
  'memo',
  'my_category',
  'opened_at',
  'expiry_date',
  'use_by_date',
  'finished_at',
];

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
 * 변경사항 일괄 동기화
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = authResult;
    const { changes } = (await request.json()) as { changes: PendingChange[] };

    if (!Array.isArray(changes)) {
      return NextResponse.json(
        { success: false, message: 'changes 배열이 필요합니다' },
        { status: 400 }
      );
    }

    const errors: { changeId: string; error: string }[] = [];
    let processedCount = 0;

    // 각 변경사항 처리
    for (const change of changes) {
      try {
        switch (change.type) {
          case 'create': {
            if (!change.productId) {
              errors.push({ changeId: change.id, error: 'productId is required for create' });
              continue;
            }

            const status = (change.changes?.status as string) || 'wishlist';
            await one<{ id: number }>(
              `INSERT INTO product_my_beauty_box (id_uuid_member, product_id, status, added_at)
               VALUES ($1, $2, $3, NOW())
               ON CONFLICT (id_uuid_member, product_id) DO NOTHING
               RETURNING id`,
              [userId, change.productId, status]
            );
            processedCount++;
            break;
          }

          case 'update': {
            if (!change.changes || Object.keys(change.changes).length === 0) {
              continue; // 변경사항 없으면 스킵
            }

            // 허용된 필드만 업데이트
            const setClauses: string[] = [];
            const values: unknown[] = [];
            let paramIndex = 1;

            for (const [key, value] of Object.entries(change.changes)) {
              if (ALLOWED_UPDATE_FIELDS.includes(key)) {
                setClauses.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
              }
            }

            if (setClauses.length > 0) {
              values.push(change.recordId);
              values.push(userId);

              await q(
                `UPDATE product_my_beauty_box
                 SET ${setClauses.join(', ')}
                 WHERE id = $${paramIndex} AND id_uuid_member = $${paramIndex + 1}`,
                values
              );
              processedCount++;
            }
            break;
          }

          case 'delete': {
            await q(
              `DELETE FROM product_my_beauty_box
               WHERE id = $1 AND id_uuid_member = $2`,
              [change.recordId, userId]
            );
            processedCount++;
            break;
          }

          default:
            errors.push({ changeId: change.id, error: `Unknown change type` });
        }
      } catch (err) {
        console.error(`[Sync] Error processing change ${change.id}:`, err);
        errors.push({
          changeId: change.id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // 최신 데이터 조회
    const products = await q<BeautyBoxItem>(
      `SELECT
        bb.id,
        bb.product_id,
        pm.product_name,
        pm.brand_name,
        pm.price_krw,
        pm.image_url,
        pm.volume_text,
        pm.category2,
        pm.avg_rating,
        pm.review_count,
        bb.added_at,
        COALESCE(bb.status, 'wishlist') as status,
        bb.memo,
        bb.my_category,
        bb.opened_at,
        bb.expiry_date,
        bb.use_by_date,
        bb.finished_at
      FROM product_my_beauty_box bb
      INNER JOIN products_master pm ON bb.product_id = pm.id
      WHERE bb.id_uuid_member = $1
      ORDER BY bb.added_at DESC`,
      [userId]
    );

    // 일부 오류가 있어도 성공으로 처리 (부분 성공)
    return NextResponse.json({
      success: true,
      products,
      syncedAt: new Date().toISOString(),
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[Sync] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '동기화 실패',
      },
      { status: 500 }
    );
  }
}
