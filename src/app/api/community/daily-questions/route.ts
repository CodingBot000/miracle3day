import { NextRequest, NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getAuthSession } from '@/lib/auth-helper';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

// GET: 오늘의 질문 목록 조회
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category'); // topic 필터 (antiaging, acne 등)
  const format = searchParams.get('format'); // question_type 필터 (poll, situation, open)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  try {
    // 1. 사용자 인증 확인 (옵셔널 - 비로그인 사용자도 질문 조회 가능)
    let memberUuid: string | null = null;
    try {
      const authSession = await getAuthSession(req);
      if (authSession) {
        const member = await findMemberByUserId(authSession.userId);
        memberUuid = member?.uuid || member?.id_uuid || null;
      }
    } catch (error) {
      // 비로그인 사용자는 투표 상태 없이 반환
      memberUuid = null;
    }

    let sql = `
      SELECT
        dq.id,
        dq.question_type,
        dq.title,
        dq.subtitle,
        dq.situation_context,
        dq.id_category,
        dq.difficulty,
        dq.points_reward,
        dq.is_active,
        dq.display_date,
        dq.view_count,
        dq.answer_count,
        dq.created_at,
        dq.updated_at,
        c.id as category_id,
        c.name as category_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', po.id,
              'option_text', po.option_text,
              'vote_count', po.vote_count,
              'display_order', po.display_order,
              'is_selected_by_user', CASE
                WHEN $1::uuid IS NOT NULL THEN EXISTS(
                  SELECT 1 FROM community_poll_votes
                  WHERE id_question = dq.id
                    AND id_option = po.id
                    AND uuid_member = $1::uuid
                )
                ELSE false
              END
            ) ORDER BY po.display_order
          ) FILTER (WHERE po.id IS NOT NULL),
          '[]'
        ) as poll_options,
        CASE
          WHEN dq.question_type = 'poll' AND $1::uuid IS NOT NULL THEN EXISTS(
            SELECT 1 FROM community_poll_votes
            WHERE id_question = dq.id
              AND uuid_member = $1::uuid
          )
          ELSE false
        END as user_has_voted
      FROM community_daily_questions dq
      LEFT JOIN community_categories c ON dq.id_category = c.id
      LEFT JOIN community_poll_options po ON dq.id = po.id_question
      WHERE dq.is_active = true
    `;

    const params: any[] = [memberUuid];

    // date 파라미터 처리: 'all'이면 모든 날짜, 아니면 특정 날짜
    if (date !== 'all') {
      sql += ` AND dq.display_date = $${params.length + 1}`;
      params.push(date);
    }

    // category 파라미터: topic 필터링 (antiaging, acne 등)
    if (category) {
      sql += ` AND dq.id_category = $${params.length + 1}`;
      params.push(category);
    }

    // format 파라미터: question_type 필터링 (poll, situation, open)
    if (format) {
      sql += ` AND dq.question_type = $${params.length + 1}`;
      params.push(format);
    }

    sql += ` GROUP BY dq.id, c.id, c.name ORDER BY dq.display_date DESC, dq.id DESC`;
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    // Count query for pagination
    let countSql = `
      SELECT COUNT(*) as total
      FROM community_daily_questions dq
      WHERE dq.is_active = true
    `;
    const countParams: any[] = [];

    // Apply same filters to count query
    if (date !== 'all') {
      countSql += ` AND dq.display_date = $${countParams.length + 1}`;
      countParams.push(date);
    }

    if (category) {
      countSql += ` AND dq.id_category = $${countParams.length + 1}`;
      countParams.push(category);
    }

    if (format) {
      countSql += ` AND dq.question_type = $${countParams.length + 1}`;
      countParams.push(format);
    }

    // Execute both queries
    const [questions, countResult] = await Promise.all([
      q(sql, params),
      q(countSql, countParams)
    ]);

    const total = parseInt(countResult[0]?.total || '0');
    const hasMore = offset + questions.length < total;

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        hasMore
      }
    });
  } catch (error: any) {
    console.error('GET daily-questions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
