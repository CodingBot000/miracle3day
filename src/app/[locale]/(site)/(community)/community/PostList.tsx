'use client'

import { MouseEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CommunityPost } from '@/models/communityData.dto';
import { ANONYMOUS_FALLBACK } from './utils';
import { useLoginGuard } from '@/hooks/useLoginGuard';
import { useLocale } from 'next-intl';
import PostCard from './PostCard';

interface PostListProps {
  posts: CommunityPost[]
  isAuthenticated: boolean
}

// 다국어 상대 시간 포맷터
const formatRelativeTime = (dateString: string, locale: string): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const units: Record<string, { just: string; min: string; hour: string; day: string; week: string }> = {
    ko: { just: '방금 전', min: '분 전', hour: '시간 전', day: '일 전', week: '주 전' },
    en: { just: 'just now', min: 'm ago', hour: 'h ago', day: 'd ago', week: 'w ago' },
    ja: { just: 'たった今', min: '分前', hour: '時間前', day: '日前', week: '週間前' },
    'zh-CN': { just: '刚刚', min: '分钟前', hour: '小时前', day: '天前', week: '周前' },
    'zh-TW': { just: '剛剛', min: '分鐘前', hour: '小時前', day: '天前', week: '週前' },
  };

  const t = units[locale] || units.en;

  if (diffInSeconds < 60) return t.just;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${t.min}`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${t.hour}`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}${t.day}`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}${t.week}`;

  // 30일 이상은 날짜 표시
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
};

export default function PostList({ posts, isAuthenticated }: PostListProps) {
  const router = useRouter();
  const locale = useLocale();

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
      {/* 컴팩트 리스트형 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-1">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No posts yet.</div>
        ) : (
          posts.map((post) => {
            const authorPresentation = getAuthorPresentation(post)
            const formattedDate = formatRelativeTime(post.created_at, locale)
            const commentCount = post.comment_count ?? 0
            const likeCount = post.like_count ?? 0

            // Get thumbnail from first image (already a full URL)
            const thumbnail = post.images?.[0] || null;

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
                thumbnail={thumbnail}
              />
            )
          })
        )}
      </div>
    </>
  )
}
