import { NextRequest, NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getAuthSession } from "@/lib/auth-helper";
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

// GET: 사용자 포인트 조회
export async function GET(req: NextRequest) {
  try {
    const authSession = await getAuthSession(req);
    if (!authSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await findMemberByUserId(authSession.userId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 403 });
    }

    const memberUuid =
      (member['uuid'] as string | undefined) ??
      (member['id_uuid'] as string | undefined) ??
      authSession.userId;

    const result = await q(
      `SELECT * FROM community_user_points WHERE uuid_member = $1`,
      [memberUuid]
    );

    if (result.length === 0) {
      // 초기 데이터 생성
      const initResult = await q(
        `INSERT INTO community_user_points (uuid_member, total_points, level)
         VALUES ($1, 0, 1) RETURNING *`,
        [memberUuid]
      );
      return NextResponse.json(initResult[0]);
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('GET user-points error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
