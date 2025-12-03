import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
import { getLocale } from 'next-intl/server';
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import CommentSection from '@/components/molecules/CommentSection';
import { Member, CommunityPost, CommunityComment } from '@/app/models/communityData.dto';
import PostNotFoundFallback from './PostNotFoundFallback';
import {
  TABLE_COMMUNITY_POSTS,
  TABLE_COMMUNITY_COMMENTS,
  TABLE_COMMUNITY_LIKES,
  TABLE_COMMUNITY_CATEGORIES,
} from '@/constants/tables';
import { q } from '@/lib/db';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';
import PostDetailCard from './PostDetailCard';

function buildCommentTree(comments: CommunityComment[]): CommunityComment[] {
  const commentMap = new Map<number, CommunityComment & { replies: CommunityComment[] }>()
  const roots: CommunityComment[] = []

  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    })
  })

  comments.forEach((comment) => {
    const node = commentMap.get(comment.id)
    if (!node) return

    if (comment.id_parent) {
      const parent = commentMap.get(comment.id_parent)
      if (parent) {
        parent.replies = [...(parent.replies ?? []), node]
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  })

  return roots
}

function countComments(comments: CommunityComment[]): number {
  return comments.reduce((total, comment) => {
    const replies = comment.replies ?? []
    return total + 1 + countComments(replies)
  }, 0)
}

export default async function PostDetailPage({
  params
}: {
  params: { id: string }
}) {
  const postId = Number(params.id);

  if (!Number.isFinite(postId)) {
    redirect('/community');
  }

  // 읽기는 로그인 불필요 - 세션이 있으면 member 정보 가져오기
  const cookieStore = cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  const auth = (session as any).auth;

  let userId: string | null = null;
  let member: any = null;
  let memberUuid: string | null = null;

  if (auth && auth.status === "active" && auth.id_uuid) {
    userId = auth.id_uuid as string;
    member = await findMemberByUserId(userId);

    if (member) {
      memberUuid =
        (member['uuid'] as string | undefined) ??
        (member['id_uuid'] as string | undefined) ??
        userId;
    }
  }

  const posts = await q(
    `SELECT p.*,
            tc.name AS topic_name,
            tc.icon AS topic_icon,
            tc.is_active AS topic_is_active,
            tg.name AS tag_name,
            tg.icon AS tag_icon,
            tg.is_active AS tag_is_active
     FROM ${TABLE_COMMUNITY_POSTS} p
     LEFT JOIN ${TABLE_COMMUNITY_CATEGORIES} tc ON tc.id = p.topic_id
     LEFT JOIN ${TABLE_COMMUNITY_CATEGORIES} tg ON tg.id = p.post_tag
     WHERE p.id = $1 AND p.is_deleted = false
     LIMIT 1`,
    [postId]
  );

  const post = posts[0] as CommunityPost & {
    topic_name?: string | { en: string; ko: string } | null;
    topic_icon?: string | null;
    topic_is_active?: boolean | null;
    tag_name?: string | { en: string; ko: string } | null;
    tag_icon?: string | null;
    tag_is_active?: boolean | null;
  };

  if (!post) {
    return <PostNotFoundFallback />;
  }

  const comments = await q(
    `SELECT c.*, m.nickname, m.avatar
     FROM ${TABLE_COMMUNITY_COMMENTS} c
     LEFT JOIN members m ON m.id_uuid = c.uuid_author
     WHERE c.id_post = $1 AND c.is_deleted = false
     ORDER BY c.created_at ASC`,
    [postId]
  );

  const formattedComments = (comments as any[]).map((comment) => ({
    ...comment,
    author: comment.nickname
      ? {
          uuid: comment.uuid_author,
          nickname: comment.nickname,
          avatar: comment.avatar,
        }
      : undefined,
  })) as CommunityComment[];

  const commentTree = buildCommentTree(formattedComments);
  const totalComments = countComments(commentTree);
  const isAuthor = memberUuid ? memberUuid === post.uuid_author : false;

  const likeCountRows = await q<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM ${TABLE_COMMUNITY_LIKES} WHERE id_post = $1`,
    [postId]
  );
  const likeCountValue = likeCountRows[0]?.count ?? post.like_count ?? 0;

  // 로그인한 경우에만 좋아요 여부 확인
  let hasUserLiked = false;
  if (memberUuid) {
    const userLikeRows = await q(
      `SELECT 1 FROM ${TABLE_COMMUNITY_LIKES} WHERE id_post = $1 AND uuid_member = $2 LIMIT 1`,
      [postId, memberUuid]
    );
    hasUserLiked = userLikeRows.length > 0;
  }

  const viewRows = await q(
    `UPDATE ${TABLE_COMMUNITY_POSTS}
     SET view_count = COALESCE(view_count, 0) + 1,
         comment_count = $1,
         like_count = $2,
         updated_at = now()
     WHERE id = $3
     RETURNING view_count`,
    [totalComments, likeCountValue, postId]
  );
  const nextViewCount =
    viewRows[0]?.view_count ?? (post.view_count ?? 0) + 1;

  // Get language from next-intl
  const locale = await getLocale();
  const language = (locale === 'ko' ? 'ko' : 'en') as 'ko' | 'en';

  const getDisplayName = (name: string | { en: string; ko: string } | null | undefined): string | null => {
    if (!name) return null;
    if (typeof name === 'string') return name;
    return name[language] || name.ko || name.en || null;
  };

  const topicName =
    post.topic_is_active === false ? null : getDisplayName(post.topic_name);

  // 로그인한 경우에만 currentUser 생성
  const currentUser: Member | null = member ? {
    uuid: memberUuid!,
    nickname:
      (member['nickname'] as string | undefined) ??
      (member['name'] as string | undefined) ??
      'Anonymous',
    name: (member['name'] as string | undefined) ?? '',
    email: (member['email'] as string | undefined) ?? '',
    avatar: member['avatar'] as string | undefined,
    created_at: (member['created_at'] as string | undefined) ?? new Date().toISOString(),
    updated_at: (member['updated_at'] as string | undefined) ?? new Date().toISOString(),
  } : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Topic badge */}
      {/* {topicName && (
        <div className="mb-4">
          <span className="inline-flex px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            {topicName}
          </span>
        </div>
      )} */}

      <div className="bg-white rounded-lg shadow-lg p-8">
        <PostDetailCard
          post={post}
          isAuthor={isAuthor}
          hasUserLiked={hasUserLiked}
          likeCount={likeCountValue}
          viewCount={nextViewCount}
          commentCount={totalComments}
          isAuthenticated={!!currentUser}
          language={language}
        />

        <CommentSection
          postId={post.id}
          comments={commentTree}
          currentUser={currentUser}
        />
      </div>
    </div>
  )
}
