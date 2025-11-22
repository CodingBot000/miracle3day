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
            const commentCount = post.comment_count ?? post.comment_count ?? 0
            const likeCount = post.like_count ?? post.like_count ?? 0

            return (
              <div
                key={post.id}
                className="block p-6 !border-2 !border-solid !border-gray-200 rounded-lg hover:!border-pink-300 hover:shadow-md transition-all bg-white"
              >
                <Link
                  href={`/community/post/${post.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  onClick={(event) => handleClick(event, post.id)}
                >
                  <div className="flex flex-col">
                  {/* 헤더: 카테고리, 작성자, 날짜 */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
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
                      <div className="h-6 w-6 overflow-hidden rounded-full bg-gray-200">
                        <img
                          src={authorPresentation.avatar}
                          alt={authorPresentation.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs">{authorPresentation.name}</span>
                    </div>
                    <span>·</span>
                    <span className="text-xs">{formattedDate}</span>
                  </div>

                  {/* 제목과 내용 */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-3">{post.content}</p>

                  {/* 통계: 조회수, 댓글, 좋아요 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto pt-3 border-t border-gray-100">
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
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
