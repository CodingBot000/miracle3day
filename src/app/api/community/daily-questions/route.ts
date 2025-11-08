import { NextRequest, NextResponse } from 'next/server';
import { q } from '@/lib/db';

// GET: 오늘의 질문 목록 조회
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category'); // topic 필터 (antiaging, acne 등)
  const format = searchParams.get('format'); // question_type 필터 (poll, situation, open)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  try {
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
              'display_order', po.display_order
            ) ORDER BY po.display_order
          ) FILTER (WHERE po.id IS NOT NULL),
          '[]'
        ) as poll_options
      FROM community_daily_questions dq
      LEFT JOIN community_categories c ON dq.id_category = c.id
      LEFT JOIN community_poll_options po ON dq.id = po.id_question
      WHERE dq.is_active = true
    `;

    const params: any[] = [];

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

    sql += ` GROUP BY dq.id, c.id, c.name ORDER BY dq.created_at DESC`;

    const questions = await q(sql, params);

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('GET daily-questions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
