import { pool } from '@/lib/db';

export interface PollComment {
  id: number;
  id_question: number;
  uuid_author: string;
  content: string;
  id_parent: number | null;
  is_deleted: boolean;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
    avatar_url: string | null;
  };
  children?: PollComment[];
}

/**
 * Poll 질문에 대한 댓글 가져오기
 */
export async function getPollComments(questionId: number): Promise<PollComment[]> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT 
        cc.*,
        m.name as author_name,
        m.avatar_url as author_avatar_url
      FROM community_comments cc
      LEFT JOIN members m ON cc.uuid_author = m.uuid OR cc.uuid_author = m.id_uuid::text
      WHERE cc.id_question = $1 
        AND cc.is_deleted = false
      ORDER BY cc.created_at ASC`,
      [questionId]
    );

    return result.rows.map(row => ({
      id: row.id,
      id_question: row.id_question,
      uuid_author: row.uuid_author,
      content: row.content,
      id_parent: row.id_parent,
      is_deleted: row.is_deleted,
      is_anonymous: row.is_anonymous,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        name: row.author_name,
        avatar_url: row.author_avatar_url,
      },
    }));
  } catch (error) {
    console.error('Error fetching poll comments:', error);
    return [];
  } finally {
    client.release();
  }
}

/**
 * Poll 댓글 개수 가져오기 (실시간 쿼리)
 */
export async function getPollCommentCount(questionId: number): Promise<number> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT COUNT(*) as count
      FROM community_comments
      WHERE id_question = $1 
        AND is_deleted = false`,
      [questionId]
    );

    return parseInt(result.rows[0].count) || 0;
  } catch (error) {
    console.error('Error counting poll comments:', error);
    return 0;
  } finally {
    client.release();
  }
}

/**
 * Poll 댓글 작성
 */
export async function createPollComment(
  questionId: number,
  memberUuid: string,
  content: string,
  parentId?: number,
  isAnonymous: boolean = false
): Promise<PollComment | null> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `INSERT INTO community_comments 
        (id_question, uuid_author, content, id_parent, is_anonymous)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [questionId, memberUuid, content, parentId || null, isAnonymous]
    );

    const comment = result.rows[0];

    // 작성자 정보 가져오기
    const authorResult = await client.query(
      `SELECT name, avatar_url FROM members 
       WHERE uuid = $1 OR id_uuid::text = $1
       LIMIT 1`,
      [memberUuid]
    );

    return {
      id: comment.id,
      id_question: comment.id_question,
      uuid_author: comment.uuid_author,
      content: comment.content,
      id_parent: comment.id_parent,
      is_deleted: comment.is_deleted,
      is_anonymous: comment.is_anonymous,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author: authorResult.rows[0] ? {
        name: authorResult.rows[0].name,
        avatar_url: authorResult.rows[0].avatar_url,
      } : undefined,
    };
  } catch (error) {
    console.error('Error creating poll comment:', error);
    return null;
  } finally {
    client.release();
  }
}

/**
 * Poll 댓글 삭제 (소프트 삭제)
 */
export async function deletePollComment(
  commentId: number,
  memberUuid: string
): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    // 작성자 확인
    const checkResult = await client.query(
      `SELECT uuid_author FROM community_comments WHERE id = $1`,
      [commentId]
    );

    if (checkResult.rows.length === 0 || checkResult.rows[0].uuid_author !== memberUuid) {
      return false;
    }

    // 소프트 삭제
    await client.query(
      `UPDATE community_comments 
      SET is_deleted = true, updated_at = NOW()
      WHERE id = $1`,
      [commentId]
    );

    return true;
  } catch (error) {
    console.error('Error deleting poll comment:', error);
    return false;
  } finally {
    client.release();
  }
}

