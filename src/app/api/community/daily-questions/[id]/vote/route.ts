import { NextRequest, NextResponse } from 'next/server';
import { q, pool } from '@/lib/db';
import { getAuthSession } from "@/lib/auth-helper";
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';
import { processActivity, ACTIVITY_TYPES } from '@/services/badges';

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

    // 재투표 체크 및 처리
    const checkVote = await client.query(
      `SELECT id, id_option FROM community_poll_votes
       WHERE id_question = $1 AND uuid_member = $2`,
      [questionId, memberUuid]
    );

    let isFirstVote = true;

    if (checkVote.rows.length > 0) {
      // 재투표 처리
      isFirstVote = false;
      const previousOption = checkVote.rows[0].id_option;

      // 같은 옵션 선택시 무시
      if (previousOption === id_option) {
        await client.query('ROLLBACK');
        return NextResponse.json({
          error: 'Already selected this option',
          alreadySelected: true
        }, { status: 400 });
      }

      // 투표 변경
      await client.query(
        `UPDATE community_poll_votes
         SET id_option = $1,
             updated_at = NOW(),
             vote_changed_count = vote_changed_count + 1
         WHERE id_question = $2 AND uuid_member = $3`,
        [id_option, questionId, memberUuid]
      );

      // 이전 옵션 vote_count 감소
      await client.query(
        `UPDATE community_poll_options
         SET vote_count = GREATEST(vote_count - 1, 0)
         WHERE id = $1`,
        [previousOption]
      );

      // 새 옵션 vote_count 증가
      await client.query(
        `UPDATE community_poll_options
         SET vote_count = vote_count + 1
         WHERE id = $1`,
        [id_option]
      );

    } else {
      // 첫 투표 처리
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
    }

    // 포인트 및 배지는 첫 투표시만 지급
    let notifications: any[] = [];
    if (isFirstVote) {
      const questionResult = await client.query(
        `SELECT points_reward FROM community_daily_questions WHERE id = $1`,
        [questionId]
      );
      const pointsToAdd = questionResult.rows[0]?.points_reward || 10;

      await addPoints(client, memberUuid, pointsToAdd, 'poll_vote', questionId);

      // Process badge activity for poll voting (only on first vote)
      notifications = await processActivity({
        userId: memberUuid,
        activityType: ACTIVITY_TYPES.POLL_VOTED,
        metadata: { questionId: questionId, optionId: id_option },
        referenceId: String(questionId),
      }).catch(err => {
        console.error('Badge error:', err);
        return [];
      });
    }

    await client.query('COMMIT');

    // 업데이트된 투표 결과 반환 (is_selected_by_user 필드 포함)
    const options = await q(
      `SELECT
        id,
        id_question,
        option_text,
        vote_count,
        display_order,
        (id = $2) as is_selected_by_user
       FROM community_poll_options
       WHERE id_question = $1
       ORDER BY display_order`,
      [questionId, id_option]
    );

    return NextResponse.json({
      success: true,
      voted_option_id: id_option,
      options,
      notifications,
      message: isFirstVote ? 'Vote recorded! +10 points' : 'Vote changed successfully!'
    });
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
  // 1. 사용자 포인트 레코드 없으면 생성 (UPSERT)
  await client.query(
    `INSERT INTO community_user_points (
      uuid_member,
      total_points,
      level,
      answers_today,
      streak_days,
      created_at,
      updated_at
    ) VALUES ($1, 0, 1, 0, 0, NOW(), NOW())
    ON CONFLICT (uuid_member) DO NOTHING`,
    [uuid_member]
  );

  // 2. 포인트 업데이트 및 레벨 계산
  const result = await client.query(
    `UPDATE community_user_points
     SET total_points = total_points + $2,
         level = FLOOR((total_points + $2) / 500) + 1,
         updated_at = NOW()
     WHERE uuid_member = $1
     RETURNING total_points, level`,
    [uuid_member, points]
  );

  // 3. 히스토리 기록 (이제 FK 제약 조건이 만족됨)
  await client.query(
    `INSERT INTO community_point_history (
      uuid_member,
      points,
      action_type,
      reference_id,
      description,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, NOW())`,
    [uuid_member, points, action_type, reference_id, `Earned ${points} points for ${action_type}`]
  );

  return result.rows[0];
}
