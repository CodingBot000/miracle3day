import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from "@/lib/auth-helper";
import { q } from '@/lib/db';
import {
  TABLE_COMMUNITY_POSTS,
  TABLE_COMMUNITY_CATEGORIES,
} from '@/constants/tables';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';
import { processActivity, ACTIVITY_TYPES } from '@/services/badges';

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),

  // New structure
  topic_id: z.enum(['antiaging', 'wrinkles', 'pigmentation', 'acne', 'surgery']),
  post_tag: z.enum(['question', 'review', 'discussion']).optional().nullable(),
  is_anonymous: z.boolean().optional().default(false),

  // Legacy field for backward compatibility
  id_category: z.string().optional().nullable(),
  author_name_snapshot: z.string().optional().nullable(),
  author_avatar_snapshot: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const authSession = await getAuthSession(req); if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const { userId } = authSession;

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

    // Handle anonymous posts - clear author info if is_anonymous is true
    const isAnonymous = payload.is_anonymous ?? false;
    let authorNameSnapshot: string | null = null;
    let authorAvatarSnapshot: string | null = null;

    if (!isAnonymous) {
      authorNameSnapshot = (payload.author_name_snapshot ??
        (member['nickname'] as string | undefined)?.trim()) ||
        (member['name'] as string | undefined)?.trim() ||
        null;

      authorAvatarSnapshot = (payload.author_avatar_snapshot ??
        (member['avatar'] as string | undefined)?.trim()) ||
        null;
    }

    const rows = await q(
      `
        INSERT INTO ${TABLE_COMMUNITY_POSTS} (
          uuid_author,
          title,
          content,
          topic_id,
          post_tag,
          is_anonymous,
          view_count,
          comment_count,
          like_count,
          author_name_snapshot,
          author_avatar_snapshot,
          created_at,
          updated_at,
          is_deleted,
          is_pinned
        )
        VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0, $7, $8, now(), now(), false, false)
        RETURNING *
      `,
      [
        memberUuid,
        payload.title,
        payload.content,
        payload.topic_id,
        payload.post_tag ?? null,
        isAnonymous,
        authorNameSnapshot,
        authorAvatarSnapshot,
      ]
    );

    const post = rows[0];

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

    // Process badge activity for post creation
    const notifications = await processActivity({
      userId: memberUuid,
      activityType: ACTIVITY_TYPES.POST_CREATED,
      metadata: {
        postId: post.id,
        topicId: post.topic_id,
        postTag: post.post_tag,
      },
      referenceId: post.id,
    }).catch(err => {
      console.error('Badge error:', err);
      return [];
    });

    return NextResponse.json({
      success: true,
      post,
      notifications,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/community/posts error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
