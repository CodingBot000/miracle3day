// api/community.ts
import { q } from '@/lib/db';
import { TABLE_COMMUNITY_POSTS, TABLE_COMMUNITY_CATEGORIES } from '@/constants/tables';
import type {
  CommunityCategory,
  CommunityPost,
  CommunityPostsDTO,
  CountRow,
} from '@/models/communityData.dto';

export async function getCommunityPostsDTO(
  topicId?: string,      // ← 파라미터 이름도 변경
  tagId?: string         // ← 새로 추가
): Promise<CommunityPostsDTO> {
  try {
    const values: any[] = [];
    const where: string[] = ['is_deleted = false'];

    if (topicId) {
      values.push(topicId);
      where.push(`topic_id = $${values.length}`);  // ← id_category → topic_id
    }

    if (tagId) {
      values.push(tagId);
      where.push(`post_tag = $${values.length}`);  // ← 새로 추가
    }

    const sql = `
      SELECT
        id,
        uuid_author,
        title,
        content,
        topic_id,                    -- ← id_category → topic_id
        post_tag,                    -- ← 새로 추가
        is_anonymous,                -- ← 새로 추가
        is_pinned,                   -- ← 새로 추가
        view_count,
        is_deleted,
        created_at,
        updated_at,
        author_name_snapshot,
        author_avatar_snapshot,
        COALESCE(comment_count, 0) AS comment_count,
        COALESCE(like_count, 0) AS like_count
      FROM ${TABLE_COMMUNITY_POSTS}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY 
        CASE WHEN is_pinned THEN 0 ELSE 1 END,  -- ← 고정글 우선
        created_at DESC
    `;

    const posts = await q<CommunityPost>(sql, values);

    if (!posts.length) {
      return { posts: [], commentsCount: [], likesCount: [] };
    }

    const normalizedPosts = posts.map((post) => ({
      ...post,
      comment_count: post.comment_count ?? 0,
      like_count: post.like_count ?? 0,
      comments_count: post.comment_count ?? 0,
      likes_count: post.like_count ?? 0,
    })) as CommunityPost[];

    const commentsCount: CountRow[] = normalizedPosts.map((post) => ({
      id_post: post.id,
      count: post.comment_count ?? 0,
    }));

    const likesCount: CountRow[] = normalizedPosts.map((post) => ({
      id_post: post.id,
      count: post.like_count ?? 0,
    }));

    return {
      posts: normalizedPosts,
      commentsCount,
      likesCount,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], commentsCount: [], likesCount: [] };
  }
}

export async function getCommunityCategories(): Promise<CommunityCategory[]> {
  try {
    const categories = await q<CommunityCategory>(
      `
        SELECT
          id,
          name,
          description,
          display_order,
          is_active,
          category_type,
          icon
        FROM ${TABLE_COMMUNITY_CATEGORIES}
        WHERE is_active = true
        ORDER BY display_order ASC
      `
    );

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
