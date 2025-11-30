import Link from 'next/link';
import LikeButton from '@/components/atoms/button/LikeButton';
import ReportButton from '@/components/atoms/button/ReportButton';
import { CommunityPost } from '@/app/models/communityData.dto';
import { ANONYMOUS_FALLBACK } from '@/app/[locale]/(site)/(pages)/community/utils';

export interface PostDetailData {
  post: CommunityPost & {
    topic_name?: string | { en: string; ko: string } | null;
    topic_icon?: string | null;
    topic_is_active?: boolean | null;
    tag_name?: string | { en: string; ko: string } | null;
    tag_icon?: string | null;
    tag_is_active?: boolean | null;
  };
  isAuthor: boolean;
  hasUserLiked: boolean;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  isAuthenticated: boolean;
  language: 'ko' | 'en';
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(new Date(dateString));
}

function getDisplayName(
  name: string | { en: string; ko: string } | null | undefined,
  language: 'ko' | 'en'
): string | null {
  if (!name) return null;
  if (typeof name === 'string') return name;
  return name[language] || name.ko || name.en || null;
}

export default function PostDetailCard({
  post,
  isAuthor,
  hasUserLiked,
  likeCount,
  viewCount,
  commentCount,
  isAuthenticated,
  language,
}: PostDetailData) {
  console.log('PostDetailCard language:', language);
  const topicName =
    post.topic_is_active === false ? null : getDisplayName(post.topic_name, language);
  const tagName =
    post.tag_is_active === false ? null : getDisplayName(post.tag_name, language);

  const authorName = post.is_anonymous
    ? ANONYMOUS_FALLBACK.name
    : post.author_name_snapshot?.trim() || ANONYMOUS_FALLBACK.name;
  const authorAvatar = post.is_anonymous
    ? ANONYMOUS_FALLBACK.avatar
    : post.author_avatar_snapshot?.trim() || ANONYMOUS_FALLBACK.avatar;

  const formattedCreatedAt = formatDate(post.created_at);

  return (
    <div>
      {/* 카테고리 뱃지 + Edit 버튼 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {topicName && (
            <span className="bg-blue-100 text-white px-3 py-1 rounded-full text-sm">
              {post.topic_icon && `${post.topic_icon} `}{topicName}
            </span>
          )}
          {tagName && (
            <span className="bg-green-100 text-white px-3 py-1 rounded-full text-sm">
              {post.tag_icon && `${post.tag_icon} `}{tagName}
            </span>
          )}
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
      {/* 작성자, 날짜 */}
      <div className="flex items-center gap-3 text-gray-500 text-sm mb-4">
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
      <h1 className="text-xl md:text-3xl font-bold mb-4">{post.title}</h1>
      <div className="prose max-w-none mb-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </div>
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialLiked={hasUserLiked}
            initialCount={likeCount}
            isAuthenticated={isAuthenticated}
          />
          <div className="flex items-center gap-1 text-gray-500">
            <span>👁</span>
            <span>{viewCount}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <span>💬</span>
            <span>{commentCount}</span>
          </div>
        </div>
        <ReportButton
          targetType="post"
          targetId={post.id}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
