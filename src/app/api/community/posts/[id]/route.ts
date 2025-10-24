import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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
              c.id AS category_id, 
              c.name AS category_name, 
              c.description AS category_description, 
              c.order_index AS category_order_index, 
              c.is_active AS category_is_active
       FROM ${TABLE_COMMUNITY_POSTS} p
       LEFT JOIN ${TABLE_COMMUNITY_CATEGORIES} c ON c.id = p.id_category
       WHERE p.id = $1 AND p.is_deleted = false
       LIMIT 1`,
      [postId]
    );

    const post = rows[0];

    if (!post) {
      return NextResponse.json({ post: null }, { status: 404 });
    }

    if (post.category_id) {
      post.category = {
        id: post.category_id,
        name: post.category_name,
        description: post.category_description,
        order_index: post.category_order_index,
        is_active: post.category_is_active,
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
  const { userId } = auth();

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
           id_category = $3,
           author_name_snapshot = $4,
           author_avatar_snapshot = $5,
           updated_at = now()
       WHERE id = $6 AND uuid_author = $7
       RETURNING *`,
      [
        payload.title,
        payload.content,
        payload.id_category ?? null,
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

    if (post.id_category) {
      const categoryRows = await q(
        `SELECT id, name, description, order_index, is_active FROM ${TABLE_COMMUNITY_CATEGORIES} WHERE id = $1`,
        [post.id_category]
      );
      post.category = categoryRows[0] ?? null;
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('PATCH /api/community/posts/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
