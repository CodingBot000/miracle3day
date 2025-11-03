import { NextRequest, NextResponse } from 'next/server';
import { q, pool } from '@/lib/db';
import { getAuthSession } from "@/lib/auth-helper";
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

// GET: 질문의 답변 목록 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = parseInt(params.id);

    const answers = await q(
      `SELECT * FROM community_question_answers
       WHERE id_question = $1 AND is_deleted = false
       ORDER BY is_best DESC, like_count DESC, created_at DESC`,
      [questionId]
    );

    return NextResponse.json({ answers });
  } catch (error: any) {
    console.error('GET answers error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: 답변 작성
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();

  try {
    const questionId = parseInt(params.id);
    const { content } = await req.json();

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

    const authorNameSnapshot =
      (member['nickname'] as string | undefined)?.trim() ||
      (member['name'] as string | undefined)?.trim() ||
      'User';

    const authorAvatarSnapshot =
      (member['avatar'] as string | undefined)?.trim() || null;

    await client.query('BEGIN');

    // 기존 답변 확인 (포인트 중복 지급 방지)
    const existingAnswerCheck = await client.query(
      `SELECT id FROM community_question_answers
       WHERE id_question = $1 AND uuid_author = $2 AND is_deleted = false`,
      [questionId, memberUuid]
    );
    const isFirstAnswer = existingAnswerCheck.rows.length === 0;

    // 질문 정보 조회 (포인트 보상값)
    const questionResult = await client.query(
      `SELECT points_reward FROM community_daily_questions WHERE id = $1`,
      [questionId]
    );
    const pointsToAdd = questionResult.rows[0]?.points_reward || 50;

    // 답변 생성
    const answerResult = await client.query(
      `INSERT INTO community_question_answers
       (id_question, uuid_author, content, author_name_snapshot, author_avatar_snapshot)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [questionId, memberUuid, content, authorNameSnapshot, authorAvatarSnapshot]
    );

    const answer = answerResult.rows[0];

    // answer_count 증가 (첫 답변일 때만)
    if (isFirstAnswer) {
      await client.query(
        `UPDATE community_daily_questions
         SET answer_count = answer_count + 1
         WHERE id = $1`,
        [questionId]
      );
    }

    // 포인트 추가 (첫 답변일 때만)
    if (isFirstAnswer) {
      await addPoints(client, memberUuid, pointsToAdd, 'answer_question', questionId);
    }

    await client.query('COMMIT');

    return NextResponse.json({ answer, isFirstAnswer }, { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('POST answer error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

// PUT: 답변 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();

  try {
    const questionId = parseInt(params.id);
    const { answerId, content } = await req.json();

    if (!answerId || !content) {
      return NextResponse.json(
        { error: 'Answer ID and content are required' },
        { status: 400 }
      );
    }

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

    // 본인의 답변인지 확인
    const answerCheck = await client.query(
      `SELECT uuid_author FROM community_question_answers
       WHERE id = $1 AND id_question = $2 AND is_deleted = false`,
      [answerId, questionId]
    );

    if (answerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      );
    }

    if (answerCheck.rows[0].uuid_author !== memberUuid) {
      return NextResponse.json(
        { error: 'You can only edit your own answers' },
        { status: 403 }
      );
    }

    // 답변 수정
    const updateResult = await client.query(
      `UPDATE community_question_answers
       SET content = $1, updated_at = NOW()
       WHERE id = $2 AND is_deleted = false
       RETURNING *`,
      [content, answerId]
    );

    const updatedAnswer = updateResult.rows[0];

    await client.query('COMMIT');

    return NextResponse.json({ answer: updatedAnswer }, { status: 200 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('PUT answer error:', error);
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
  await client.query(
    `INSERT INTO community_point_history (uuid_member, points, action_type, reference_id)
     VALUES ($1, $2, $3, $4)`,
    [uuid_member, points, action_type, reference_id]
  );

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
    await client.query(
      `INSERT INTO community_user_points (uuid_member, total_points, level)
       VALUES ($1, $2, 1)`,
      [uuid_member, points]
    );
  }
}
