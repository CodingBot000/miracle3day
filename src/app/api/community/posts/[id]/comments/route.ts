import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from "@/lib/auth-helper";
import { z } from 'zod';
import { q } from '@/lib/db';
import {
  TABLE_COMMUNITY_COMMENTS,
  TABLE_COMMUNITY_POSTS,
} from '@/constants/tables';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

const createSchema = z.object({
  content: z.string().min(1),
  parentId: z.union([z.number(), z.string().transform(Number)]).optional().nullable(),
});

async function recalcCommentCount(postId: number | string) {
  const countRows = await q<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM ${TABLE_COMMUNITY_COMMENTS} WHERE id_post = $1 AND is_deleted = false`,
    [postId]
  );

  const total = countRows[0]?.count ?? 0;

  await q(
    `UPDATE ${TABLE_COMMUNITY_POSTS}
     SET comment_count = $1, updated_at = now()
     WHERE id = $2`,
    [total, postId]
  );

  return total;
}

export async function POST(
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
    const payload = createSchema.parse(body);

    const member = await findMemberByUserId(userId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 403 });
    }

    const memberUuid =
      (member['uuid'] as string | undefined) ??
      (member['id_uuid'] as string | undefined) ??
      userId;

    const rows = await q(
      `INSERT INTO ${TABLE_COMMUNITY_COMMENTS} (
        id_post,
        uuid_author,
        content,
        id_parent,
        is_deleted,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, false, now(), now())
      RETURNING *`,
      [postId, memberUuid, payload.content, payload.parentId ?? null]
    );

    const comment = rows[0];

    if (!comment) {
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    const total = await recalcCommentCount(postId);

    comment.author = {
      uuid: memberUuid,
      nickname:
        (member['nickname'] as string | undefined) ??
        (member['name'] as string | undefined) ??
        'Anonymous',
      avatar: member['avatar'] as string | undefined,
    };
    comment.replies = [];

    return NextResponse.json({ comment, total });
  } catch (error) {
    console.error('POST /api/community/posts/[id]/comments error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
