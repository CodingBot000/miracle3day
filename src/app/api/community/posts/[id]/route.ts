import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from "@/lib/auth-helper";
import { z } from 'zod';
import { q } from '@/lib/db';
import {
  TABLE_COMMUNITY_POSTS,
  TABLE_COMMUNITY_CATEGORIES,
} from '@/constants/tables';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

const updateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),

  // New structure
  topic_id: z.enum(['antiaging', 'wrinkles', 'pigmentation', 'acne', 'surgery']).optional(),
  post_tag: z.enum(['question', 'review', 'discussion']).optional().nullable(),

  // Legacy field for backward compatibility
  id_category: z.string().optional().nullable(),
  author_name_snapshot: z.string().optional().nullable(),
  author_avatar_snapshot: z.string().optional().nullable(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const postId = Number(params.id);

  if (!Number.isFinite(postId)) {
    return NextResponse.json({ post: null }, { status: 400 });
  }

  try {
    const rows = await q(
      `SELECT p.*,
              tc.id AS topic_id_cat,
              tc.name AS topic_name,
              tc.description AS topic_description,
              tc.icon AS topic_icon,
              tc.category_type AS topic_category_type,
              tc.display_order AS topic_display_order,
              tc.is_active AS topic_is_active,
              tg.id AS tag_id_cat,
              tg.name AS tag_name,
              tg.description AS tag_description,
              tg.icon AS tag_icon,
              tg.category_type AS tag_category_type,
              tg.display_order AS tag_display_order,
              tg.is_active AS tag_is_active
       FROM ${TABLE_COMMUNITY_POSTS} p
       LEFT JOIN ${TABLE_COMMUNITY_CATEGORIES} tc ON tc.id = p.topic_id
       LEFT JOIN ${TABLE_COMMUNITY_CATEGORIES} tg ON tg.id = p.post_tag
       WHERE p.id = $1 AND p.is_deleted = false
       LIMIT 1`,
      [postId]
    );

    const post = rows[0];

    if (!post) {
      return NextResponse.json({ post: null }, { status: 404 });
    }

    if (post.topic_id_cat) {
      post.topic = {
        id: post.topic_id_cat,
        name: post.topic_name,
        description: post.topic_description,
        icon: post.topic_icon,
        category_type: post.topic_category_type,
        display_order: post.topic_display_order,
        is_active: post.topic_is_active,
      };
    }

    if (post.tag_id_cat) {
      post.tag = {
        id: post.tag_id_cat,
        name: post.tag_name,
        description: post.tag_description,
        icon: post.tag_icon,
        category_type: post.tag_category_type,
        display_order: post.tag_display_order,
        is_active: post.tag_is_active,
      };
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('GET /api/community/posts/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authSession = await getAuthSession(req); if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const { userId } = authSession;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const postId = Number(params.id);

  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const payload = updateSchema.parse(body);

    const member = await findMemberByUserId(userId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 403 });
    }

    const memberUuid =
      (member['uuid'] as string | undefined) ??
      (member['id_uuid'] as string | undefined) ??
      userId;

    const result = await q(
      `UPDATE ${TABLE_COMMUNITY_POSTS}
       SET title = $1,
           content = $2,
           topic_id = $3,
           post_tag = $4,
           author_name_snapshot = $5,
           author_avatar_snapshot = $6,
           updated_at = now()
       WHERE id = $7 AND uuid_author = $8
       RETURNING *`,
      [
        payload.title,
        payload.content,
        payload.topic_id ?? null,
        payload.post_tag ?? null,
        payload.author_name_snapshot ?? null,
        payload.author_avatar_snapshot ?? null,
        postId,
        memberUuid,
      ]
    );

    const post = result[0];

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Fetch topic and tag categories
    if (post?.topic_id) {
      const topicRows = await q(
        `SELECT id, name, description, icon, category_type, display_order, is_active FROM ${TABLE_COMMUNITY_CATEGORIES} WHERE id = $1`,
        [post.topic_id]
      );
      post.topic = topicRows[0] ?? null;
    }

    if (post?.post_tag) {
      const tagRows = await q(
        `SELECT id, name, description, icon, category_type, display_order, is_active FROM ${TABLE_COMMUNITY_CATEGORIES} WHERE id = $1`,
        [post.post_tag]
      );
      post.tag = tagRows[0] ?? null;
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('PATCH /api/community/posts/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
