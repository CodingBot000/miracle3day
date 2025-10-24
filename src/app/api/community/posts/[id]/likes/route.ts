import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from "@/lib/auth-helper";
import { q } from '@/lib/db';
import {
  TABLE_COMMUNITY_LIKES,
  TABLE_COMMUNITY_POSTS,
} from '@/constants/tables';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

async function updateLikeCount(postId: number | string) {
  const countRows = await q<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM ${TABLE_COMMUNITY_LIKES} WHERE id_post = $1`,
    [postId]
  );

  const total = countRows[0]?.count ?? 0;

  await q(
    `UPDATE ${TABLE_COMMUNITY_POSTS}
     SET like_count = $1, updated_at = now()
     WHERE id = $2`,
    [total, postId]
  );

  return total;
}

export async function POST(
  _req: NextRequest,
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
    const member = await findMemberByUserId(userId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 403 });
    }

    const memberUuid =
      (member['uuid'] as string | undefined) ??
      (member['id_uuid'] as string | undefined) ??
      userId;

    await q(
      `INSERT INTO ${TABLE_COMMUNITY_LIKES} (id_post, uuid_member, created_at)
       VALUES ($1, $2, now())
       ON CONFLICT DO NOTHING`,
      [postId, memberUuid]
    );

    const total = await updateLikeCount(postId);

    return NextResponse.json({ liked: true, count: total });
  } catch (error) {
    console.error('POST /api/community/posts/[id]/likes error:', error);
    const message = error instanceof Error ? error.message : 'Failed to like post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
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
    const member = await findMemberByUserId(userId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 403 });
    }

    const memberUuid =
      (member['uuid'] as string | undefined) ??
      (member['id_uuid'] as string | undefined) ??
      userId;

    await q(
      `DELETE FROM ${TABLE_COMMUNITY_LIKES}
       WHERE id_post = $1 AND uuid_member = $2`,
      [postId, memberUuid]
    );

    const total = await updateLikeCount(postId);

    return NextResponse.json({ liked: false, count: total });
  } catch (error) {
    console.error('DELETE /api/community/posts/[id]/likes error:', error);
    const message = error instanceof Error ? error.message : 'Failed to unlike post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
