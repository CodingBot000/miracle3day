import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import CommentSection from '@/components/molecules/CommentSection';
import LikeButton from '@/components/atoms/button/LikeButton';
import ReportButton from '@/components/atoms/button/ReportButton';
import { Member, CommunityPost, CommunityComment } from '@/app/models/communityData.dto';
import PostNotFoundFallback from './PostNotFoundFallback';
import SetCommunityHeader from '../../SetCommunityHeader';
import { ANONYMOUS_FALLBACK, isAnonymousCategoryName } from '../../utils';
import { getImageUrl } from '@/lib/images';
import {
  TABLE_COMMUNITY_POSTS,
  TABLE_COMMUNITY_COMMENTS,
  TABLE_COMMUNITY_LIKES,
  TABLE_COMMUNITY_CATEGORIES,
} from '@/constants/tables';
import { q } from '@/lib/db';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

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

  // Get language from cookie
  const languageCookie = cookieStore.get('language');
  const language = (languageCookie?.value as 'ko' | 'en') || 'ko';

  const getDisplayName = (name: string | { en: string; ko: string } | null | undefined): string | null => {
    if (!name) return null;
    if (typeof name === 'string') return name;
    return name[language] || name.ko || name.en || null;
  };

  const topicName =
    post.topic_is_active === false ? null : getDisplayName(post.topic_name);
  const tagName =
    post.tag_is_active === false ? null : getDisplayName(post.tag_name);

  // Use is_anonymous field instead of category check
  const authorName = post.is_anonymous
    ? ANONYMOUS_FALLBACK.name
    : post.author_name_snapshot?.trim() || ANONYMOUS_FALLBACK.name;
  const authorAvatar = post.is_anonymous
    ? ANONYMOUS_FALLBACK.avatar
    : post.author_avatar_snapshot?.trim() || ANONYMOUS_FALLBACK.avatar;

  const formattedCreatedAt = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(new Date(post.created_at));

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
      <SetCommunityHeader>
        <div className="mt-4">
          <span className="inline-flex px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            {topicName ?? 'Community'}
          </span>
        </div>
      </SetCommunityHeader>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {topicName && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {post.topic_icon && `${post.topic_icon} `}{topicName}
                </span>
              )}
              {tagName && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {post.tag_icon && `${post.tag_icon} `}{tagName}
                </span>
              )}
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <span className="block h-9 w-9 overflow-hidden rounded-full bg-gray-200">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </span>
                <span className="font-medium text-gray-900">{authorName}</span>
                <span>·</span>
                <span>{formattedCreatedAt}</span>
              </div>
            </div>
            {isAuthor && (
              <div className="flex gap-2">
                <Link
                  href={`/community/edit/${post.id}`}
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  Edit
                </Link>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <LikeButton
                postId={post.id}
                initialLiked={hasUserLiked}
                initialCount={likeCountValue}
                isAuthenticated={!!currentUser}
              />
              <div className="flex items-center gap-1 text-gray-500">
                <span>👁</span>
                <span>{nextViewCount}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <span>💬</span>
                <span>{totalComments}</span>
              </div>
            </div>
            <ReportButton
              targetType="post"
              targetId={post.id}
              isAuthenticated={!!currentUser}
            />
          </div>
        </div>

        <CommentSection
          postId={post.id}
          comments={commentTree}
          currentUser={currentUser}
        />
      </div>
    </div>
  )
}
