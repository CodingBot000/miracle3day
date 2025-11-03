import { NextRequest, NextResponse } from 'next/server';
import { q, pool } from '@/lib/db';
import { getAuthSession } from "@/lib/auth-helper";
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

// POST: 투표하기
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();

  try {
    const questionId = parseInt(params.id);
    const { id_option } = await req.json();

    // 인증 확인
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

    await client.query('BEGIN');

    // 중복 투표 체크
    const checkVote = await client.query(
      `SELECT id FROM community_poll_votes
       WHERE id_question = $1 AND uuid_member = $2`,
      [questionId, memberUuid]
    );

    if (checkVote.rows.length > 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    // 투표 생성
    await client.query(
      `INSERT INTO community_poll_votes (id_question, id_option, uuid_member)
       VALUES ($1, $2, $3)`,
      [questionId, id_option, memberUuid]
    );

    // 옵션 vote_count 증가
    await client.query(
      `UPDATE community_poll_options
       SET vote_count = vote_count + 1
       WHERE id = $1`,
      [id_option]
    );

    // 질문 정보 조회 (포인트 보상값)
    const questionResult = await client.query(
      `SELECT points_reward FROM community_daily_questions WHERE id = $1`,
      [questionId]
    );
    const pointsToAdd = questionResult.rows[0]?.points_reward || 10;

    // 포인트 추가
    await addPoints(client, memberUuid, pointsToAdd, 'poll_vote', questionId);

    await client.query('COMMIT');

    // 업데이트된 투표 결과 반환
    const options = await q(
      `SELECT * FROM community_poll_options
       WHERE id_question = $1
       ORDER BY display_order`,
      [questionId]
    );

    return NextResponse.json({ options });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Vote error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// 포인트 추가 헬퍼 함수
async function addPoints(
  client: any,
  uuid_member: string,
  points: number,
  action_type: string,
  reference_id?: number
) {
  // 포인트 히스토리 추가
  await client.query(
    `INSERT INTO community_point_history (uuid_member, points, action_type, reference_id)
     VALUES ($1, $2, $3, $4)`,
    [uuid_member, points, action_type, reference_id]
  );

  // 사용자 포인트 조회
  const userPointsResult = await client.query(
    `SELECT * FROM community_user_points WHERE uuid_member = $1`,
    [uuid_member]
  );

  if (userPointsResult.rows.length > 0) {
    const userPoints = userPointsResult.rows[0];
    const newTotal = userPoints.total_points + points;
    const newLevel = Math.floor(newTotal / 500) + 1;

    await client.query(
      `UPDATE community_user_points
       SET total_points = $1, level = $2, updated_at = NOW()
       WHERE uuid_member = $3`,
      [newTotal, newLevel, uuid_member]
    );
  } else {
    // 첫 포인트
    await client.query(
      `INSERT INTO community_user_points (uuid_member, total_points, level)
       VALUES ($1, $2, 1)`,
      [uuid_member, points]
    );
  }
}
