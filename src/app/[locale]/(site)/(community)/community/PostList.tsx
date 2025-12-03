'use client'

import { MouseEvent, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CommunityPost } from '@/app/models/communityData.dto';
import { ANONYMOUS_FALLBACK } from './utils';
import { useLoginGuard } from '@/hooks/useLoginGuard';
import { useLocale } from 'next-intl';
import PostCard from './PostCard';

interface PostListProps {
  posts: CommunityPost[]
  isAuthenticated: boolean
}

export default function PostList({ posts, isAuthenticated }: PostListProps) {
  const router = useRouter();
  const locale = useLocale();
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

  const { requireLogin, loginModal } = useLoginGuard();

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
    // 새 탭에서 열기 - meta/ctrl 키 누른 경우 브라우저 기본 동작 유지
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    // 일반 클릭 - 새 탭에서 열기
    event.preventDefault();
    window.open(`/community/post/${postId}`, '_blank');
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
      {/* 모바일: 1열, 데스크탑: 2열 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">No posts yet.</div>
        ) : (
          posts.map((post) => {
            const authorPresentation = getAuthorPresentation(post)
            const formattedDate = formatDate(post.created_at)
            const commentCount = post.comment_count ?? 0
            const likeCount = post.like_count ?? 0

            return (
              <PostCard
                key={post.id}
                post={post}
                authorPresentation={authorPresentation}
                formattedDate={formattedDate}
                commentCount={commentCount}
                likeCount={likeCount}
                language={locale as 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW'}
                onClickPost={handleClick}
              />
            )
          })
        )}
      </div>
    </>
  )
}
