import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { q } from '@/lib/db';
import {
  TABLE_COMMUNITY_COMMENTS,
  TABLE_COMMUNITY_POSTS,
} from '@/constants/tables';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

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

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const commentId = Number(params.id);

    if (!Number.isFinite(commentId)) {
      return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 });
    }

    const member = await findMemberByUserId(userId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 403 });
    }

    const memberUuid =
      (member['uuid'] as string | undefined) ??
      (member['id_uuid'] as string | undefined) ??
      userId;

    const rows = await q(
      `UPDATE ${TABLE_COMMUNITY_COMMENTS}
       SET is_deleted = true,
           updated_at = now()
       WHERE id = $1 AND uuid_author = $2
       RETURNING id_post`,
      [commentId, memberUuid]
    );

    const comment = rows[0];

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const total = await recalcCommentCount(comment.id_post);

    return NextResponse.json({ ok: true, total });
  } catch (error) {
    console.error('DELETE /api/community/comments/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
