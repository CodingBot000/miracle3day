import { NextRequest, NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getAuthSession } from '@/lib/auth-helper';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

// GET: 오늘의 질문 목록 조회 (rotation_order 기반)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic'); // topic 필터 (antiaging, acne 등) - NEW
  const category = searchParams.get('category'); // 하위 호환성을 위해 유지
  const format = searchParams.get('format'); // question_type 필터 (poll, situation, open)
  const filter = searchParams.get('filter'); // Daily Questions 필터 (trending, seasonal, urgent, beginner)
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

    // rotation_order 기반 쿼리로 변경
    let sql = `
      WITH config AS (
        SELECT
          (SELECT value::DATE FROM app_config WHERE key = 'service_open_date') as open_date,
          (SELECT value::INT FROM app_config WHERE key = 'question_rotation_days') as rotation_days,
          (SELECT value::INT FROM app_config WHERE key = 'daily_questions.today_count') as today_count
      )
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
        dq.rotation_order,
        dq.tags,
        dq.view_count,
        dq.answer_count,
        dq.created_at,
        dq.updated_at,
        (dq.view_count + dq.answer_count * 5) as engagement_score,
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
      CROSS JOIN config
      WHERE dq.is_active = true
    `;

    const params: any[] = [memberUuid];

    // 첫 페이지: rotation_order 기반 필터링
    if (page === 1) {
      sql += ` AND dq.rotation_order % COALESCE((SELECT value::INT FROM app_config WHERE key = 'question_rotation_days'), 30) =
               (CURRENT_DATE - COALESCE((SELECT value::DATE FROM app_config WHERE key = 'service_open_date'), '2025-01-01'::DATE)) %
               COALESCE((SELECT value::INT FROM app_config WHERE key = 'question_rotation_days'), 30)`;
    }

    // topic 파라미터: topic 필터링 (antiaging, acne 등)
    // topic_id 또는 tags 내 topics 배열 확인
    const topicParam = topic || category; // topic 우선, 없으면 category (하위 호환성)
    if (topicParam) {
      sql += ` AND (dq.id_category = $${params.length + 1} OR dq.topic_id = $${params.length + 1} OR dq.tags @> $${params.length + 2}::jsonb)`;
      params.push(topicParam);
      params.push(JSON.stringify({ topics: [topicParam] }));
    }

    // format 파라미터: question_type 필터링 (poll, situation, open)
    if (format) {
      sql += ` AND dq.question_type = $${params.length + 1}`;
      params.push(format);
    }

    // filter 파라미터: Daily Questions 필터 (trending, seasonal, urgent, beginner)
    if (filter) {
      switch(filter) {
        case 'trending':
          sql += ` AND dq.tags @> '{"trend": ["trending"]}'::jsonb`;
          break;
        case 'seasonal':
          sql += ` AND dq.tags @> '{"trend": ["seasonal-concern"]}'::jsonb`;
          break;
        case 'urgent':
          sql += ` AND dq.tags @> '{"urgency": ["urgent"]}'::jsonb`;
          break;
        case 'beginner':
          sql += ` AND dq.tags @> '{"trend": ["first-timer"]}'::jsonb`;
          break;
      }
    }

    sql += ` GROUP BY dq.id, c.id, c.name ORDER BY engagement_score DESC, dq.id DESC`;
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
    if (page === 1) {
      countSql += ` AND dq.rotation_order % COALESCE((SELECT value::INT FROM app_config WHERE key = 'question_rotation_days'), 30) =
                   (CURRENT_DATE - COALESCE((SELECT value::DATE FROM app_config WHERE key = 'service_open_date'), '2025-01-01'::DATE)) %
                   COALESCE((SELECT value::INT FROM app_config WHERE key = 'question_rotation_days'), 30)`;
    }

    const topicParamForCount = topic || category;
    if (topicParamForCount) {
      countSql += ` AND (dq.id_category = $${countParams.length + 1} OR dq.topic_id = $${countParams.length + 1} OR dq.tags @> $${countParams.length + 2}::jsonb)`;
      countParams.push(topicParamForCount);
      countParams.push(JSON.stringify({ topics: [topicParamForCount] }));
    }

    if (format) {
      countSql += ` AND dq.question_type = $${countParams.length + 1}`;
      countParams.push(format);
    }

    // Apply filter to count query
    if (filter) {
      switch(filter) {
        case 'trending':
          countSql += ` AND dq.tags @> '{"trend": ["trending"]}'::jsonb`;
          break;
        case 'seasonal':
          countSql += ` AND dq.tags @> '{"trend": ["seasonal-concern"]}'::jsonb`;
          break;
        case 'urgent':
          countSql += ` AND dq.tags @> '{"urgency": ["urgent"]}'::jsonb`;
          break;
        case 'beginner':
          countSql += ` AND dq.tags @> '{"trend": ["first-timer"]}'::jsonb`;
          break;
      }
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
