'use client'

import { MouseEvent, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CommunityPost } from '@/app/models/communityData.dto';
import { ANONYMOUS_FALLBACK, isAnonymousCategoryName } from './utils';
import { useLoginGuard } from '@/hooks/useLoginGuard';
import { getImageUrl } from '@/lib/images';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';

interface PostListProps {
  posts: CommunityPost[]
  isAuthenticated: boolean
}

export default function PostList({ posts, isAuthenticated }: PostListProps) {
  const router = useRouter();
  const { language } = useCookieLanguage();
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

  // 뒤로가기/앞으로가기 시 자동 새로고침
  useEffect(() => {
    const handlePopState = () => {
      router.refresh(); // 서버 데이터 재검증
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    return dateFormatter.format(parsed);
  };

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>, postId: number) => {
    // 읽기는 로그인 불필요 - 바로 이동
    // view_count는 서버에서 자동 증가됨
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return;
    }

    event.preventDefault();
    router.push(`/community/post/${postId}`);
  };

  const getAuthorPresentation = (post: CommunityPost) => {
    // New structure: use is_anonymous field
    if (post.is_anonymous) {
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
                    {post.topic && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {typeof post.topic.name === 'string' ? post.topic.name : post.topic.name[language]}
                      </span>
                    )}
                    {post.tag && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {typeof post.tag.name === 'string' ? post.tag.name : post.tag.name[language]}
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
