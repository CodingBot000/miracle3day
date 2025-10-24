import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { q } from '@/lib/db';
import {
  TABLE_COMMUNITY_POSTS,
  TABLE_COMMUNITY_CATEGORIES,
} from '@/constants/tables';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  id_category: z.string().optional().nullable(),
  author_name_snapshot: z.string().optional().nullable(),
  author_avatar_snapshot: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const payload = createSchema.parse(body);

    const member = await findMemberByUserId(userId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 403 });
    }

    const memberUuid =
      (member['uuid'] as string | undefined) ??
      (member['id_uuid'] as string | undefined) ??
      userId;

    const categoryId = payload.id_category ?? null;
    let authorNameSnapshot = payload.author_name_snapshot ?? null;
    let authorAvatarSnapshot = payload.author_avatar_snapshot ?? null;

    if (!authorNameSnapshot) {
      authorNameSnapshot =
        (member['nickname'] as string | undefined)?.trim() ||
        (member['name'] as string | undefined)?.trim() ||
        null;
    }

    if (!authorAvatarSnapshot) {
      authorAvatarSnapshot =
        (member['avatar'] as string | undefined)?.trim() || null;
    }

    const rows = await q(
      `
        INSERT INTO ${TABLE_COMMUNITY_POSTS} (
          uuid_author,
          title,
          content,
          id_category,
          view_count,
          comment_count,
          like_count,
          author_name_snapshot,
          author_avatar_snapshot,
          created_at,
          updated_at,
          is_deleted
        )
        VALUES ($1, $2, $3, $4, 0, 0, 0, $5, $6, now(), now(), false)
        RETURNING *
      `,
      [
        memberUuid,
        payload.title,
        payload.content,
        categoryId,
        authorNameSnapshot,
        authorAvatarSnapshot,
      ]
    );

    const post = rows[0];

    if (post?.id_category) {
      const categoryRows = await q(
        `SELECT id, name, description, order_index, is_active FROM ${TABLE_COMMUNITY_CATEGORIES} WHERE id = $1`,
        [post.id_category]
      );
      post.category = categoryRows[0] ?? null;
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('POST /api/community/posts error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
