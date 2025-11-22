import { pool } from '@/lib/db';

export interface PollQuestion {
  id: number;
  question_type: string;
  title: any; // JSONB
  subtitle?: any; // JSONB
  points_reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: number;
  id_question: number;
  option_text: any; // JSONB
  vote_count: number;
  display_order: number;
  is_selected_by_user?: boolean;
}

export interface PollVote {
  id: number;
  id_question: number;
  id_option: number;
  uuid_member: string;
  created_at: string;
}

/**
 * Poll 질문 ID로 질문 가져오기
 */
export async function getPollQuestionById(questionId: number): Promise<PollQuestion | null> {
  if (!Number.isFinite(questionId) || questionId <= 0) {
    return null;
  }

  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT 
        id,
        question_type,
        title,
        subtitle,
        points_reward,
        is_active,
        created_at,
        updated_at
      FROM community_daily_questions
      WHERE id = $1 AND is_active = true`,
      [questionId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as PollQuestion;
  } catch (error) {
    console.error('Error fetching poll question:', error);
    return null;
  } finally {
    client.release();
  }
}

/**
 * Poll 옵션과 투표 결과 가져오기
 */
export async function getPollOptionsWithVotes(
  questionId: number,
  memberUuid?: string | null
): Promise<PollOption[]> {
  if (!Number.isFinite(questionId) || questionId <= 0) {
    return [];
  }

  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT 
        po.id,
        po.id_question,
        po.option_text,
        po.vote_count,
        po.display_order,
        CASE
          WHEN $2::uuid IS NOT NULL THEN EXISTS(
            SELECT 1 FROM community_poll_votes
            WHERE id_question = $1
              AND id_option = po.id
              AND uuid_member = $2::uuid
          )
          ELSE false
        END as is_selected_by_user
      FROM community_poll_options po
      WHERE po.id_question = $1
      ORDER BY po.display_order`,
      [questionId, memberUuid || null]
    );

    return result.rows as PollOption[];
  } catch (error) {
    console.error('Error fetching poll options:', error);
    return [];
  } finally {
    client.release();
  }
}

/**
 * 사용자의 Poll 투표 정보 가져오기
 */
export async function getUserPollVote(
  questionId: number,
  memberUuid: string
): Promise<PollVote | null> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT 
        id,
        id_question,
        id_option,
        uuid_member,
        created_at
      FROM community_poll_votes
      WHERE id_question = $1 AND uuid_member = $2
      LIMIT 1`,
      [questionId, memberUuid]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as PollVote;
  } catch (error) {
    console.error('Error fetching user poll vote:', error);
    return null;
  } finally {
    client.release();
  }
}

