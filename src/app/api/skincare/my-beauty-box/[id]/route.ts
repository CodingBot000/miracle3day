/**
 * My Beauty Box 개별 삭제 API
 *
 * DELETE /api/skincare/my-beauty-box/[id] - 개별 제품 삭제
 * - 인증 필요 (JWT 토큰)
 * - 본인 소유 항목만 삭제 가능
 */

import { NextRequest, NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

/**
 * My Beauty Box에서 제품 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const beautyBoxId = parseInt(id, 10);

    if (isNaN(beautyBoxId)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 ID입니다' },
        { status: 400 }
      );
    }

    // 인증 검사
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

    const userId = payload.sub;

    // 본인 소유 항목인지 확인 후 삭제
    const result = await one<{ id: number }>(
      `DELETE FROM product_my_beauty_box
       WHERE id = $1 AND id_uuid_member = $2
       RETURNING id`,
      [beautyBoxId, userId]
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: '삭제할 항목을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '삭제되었습니다',
    });
  } catch (error) {
    console.error('My Beauty Box 삭제 오류:', error);
    const message = error instanceof Error ? error.message : '삭제 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
