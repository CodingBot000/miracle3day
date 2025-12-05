'use client'

import { MouseEvent } from 'react';
import { Link } from '@/i18n/routing';
import type { CommunityPost } from '@/app/models/communityData.dto';

interface PostCardProps {
  post: CommunityPost;
  authorPresentation: {
    name: string;
    avatar: string;
  };
  formattedDate: string;
  commentCount: number;
  likeCount: number;
  language: 'en' | 'ko' | 'ja' | 'zh-CN' | 'zh-TW';
  onClickPost: (event: MouseEvent<HTMLAnchorElement>, postId: number) => void;
  thumbnail?: string | null;
}

export default function PostCard({
  post,
  authorPresentation,
  formattedDate,
  commentCount,
  likeCount,
  language,
  onClickPost,
  thumbnail,
}: PostCardProps) {
  return (
    <div className="block px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white">
      <Link
        href={`/community/post/${post.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onClick={(event) => onClickPost(event, post.id)}
      >
        <div className="flex gap-3">
          {/* 좌측: 텍스트 콘텐츠 */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* 카테고리 뱃지 + 작성자 + 날짜 */}
            <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
              {post.topic && (
                <span className="bg-blue-300 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                  {typeof post.topic.name === 'string' ? post.topic.name : post.topic.name[language]}
                </span>
              )}
              {post.tag && (
                <span className="bg-green-300 text-green-700 px-1.5 py-0.5 rounded text-xs">
                  {typeof post.tag.name === 'string' ? post.tag.name : post.tag.name[language]}
                </span>
              )}
              <span className="truncate">{authorPresentation.name}</span>
              <span>·</span>
              <span className="flex-shrink-0">{formattedDate}</span>
            </div>

            {/* 제목 */}
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1 mb-0.5">
              {post.title}
            </h3>

            {/* 본문 미리보기 */}
            <p className="text-sm text-gray-500 line-clamp-1 mb-2">{post.content}</p>

            {/* 통계: 조회수, 댓글, 좋아요 */}
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto">
              <span>조회 {post.view_count}</span>
              <span>댓글 {commentCount}</span>
              <span>좋아요 {likeCount}</span>
            </div>
          </div>

          {/* 우측: 썸네일 (있을 경우만) */}
          {thumbnail && (
            <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={thumbnail}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
