'use client'

import { MouseEvent, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CommunityPost } from '@/app/models/communityData.dto';
import { ANONYMOUS_FALLBACK, isAnonymousCategoryName } from './utils';
import { useLoginGuard } from '@/hooks/useLoginGuard';
import { getImageUrl } from '@/lib/images';

interface PostListProps {
  posts: CommunityPost[]
  isAuthenticated: boolean
}

export default function PostList({ posts, isAuthenticated }: PostListProps) {
  const router = useRouter();
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'Asia/Seoul',
      }),
    []
  );

  const { requireLogin, loginModal } = useLoginGuard(isAuthenticated);

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    return dateFormatter.format(parsed);
  };

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>, postId: number) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return;
    }

    event.preventDefault();

    if (!requireLogin()) {
      return;
    }

    router.push(`/community/post/${postId}`);
  };

  const getAuthorPresentation = (post: CommunityPost) => {
    const anonymous = isAnonymousCategoryName(post.category?.name)
    if (anonymous) {
      return ANONYMOUS_FALLBACK
    }

    return {
      name: post.author_name_snapshot?.trim() || ANONYMOUS_FALLBACK.name,
      avatar: post.author_avatar_snapshot?.trim() || ANONYMOUS_FALLBACK.avatar,
    }
  }

  return (
    <>
      {loginModal}
      <div className="divide-y divide-gray-200">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No posts yet.</div>
        ) : (
          posts.map((post) => {
            const authorPresentation = getAuthorPresentation(post)
          const formattedDate = formatDate(post.created_at)
          const commentCount = post.comment_count ?? post.comment_count ?? 0
          const likeCount = post.like_count ?? post.like_count ?? 0

          return (
            <Link
              key={post.id}
              href={`/community/post/${post.id}`}
              className="block p-6 hover:bg-gray-50 transition-colors"
              onClick={(event) => handleClick(event, post.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                    {post.category && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {post.category.name}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 overflow-hidden rounded-full bg-gray-200">
                        <img
                          src={authorPresentation.avatar}
                          alt={authorPresentation.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <span>{authorPresentation.name}</span>
                    </div>
                    <span>·</span>
                    <span>{formattedDate}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2">{post.content}</p>
                </div>
                <div className="ml-4 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>👁</span>
                    <span>{post.view_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💬</span>
                    <span>{commentCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>❤️</span>
                    <span>{likeCount}</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })
      )}
      </div>
    </>
  )
}
