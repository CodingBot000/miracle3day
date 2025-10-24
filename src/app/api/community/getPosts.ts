// api/community.ts
import { q } from '@/lib/db';
import { TABLE_COMMUNITY_POSTS, TABLE_COMMUNITY_CATEGORIES } from '@/constants/tables';
import type {
  CommunityCategory,
  CommunityPost,
  CommunityPostsDTO,
  CountRow,
} from '@/app/models/communityData.dto';

export async function getCommunityPostsDTO(categoryId?: string): Promise<CommunityPostsDTO> {
  try {
    const values: any[] = [];
    const where: string[] = ['is_deleted = false'];

    if (categoryId) {
      values.push(categoryId);
      where.push(`id_category = $${values.length}`);
    }

    const sql = `
      SELECT
        id,
        uuid_author,
        title,
        content,
        id_category,
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
      ORDER BY created_at DESC
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
        SELECT id, name, description, order_index, is_active
        FROM ${TABLE_COMMUNITY_CATEGORIES}
        WHERE is_active = true
        ORDER BY order_index ASC
      `
    );

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
