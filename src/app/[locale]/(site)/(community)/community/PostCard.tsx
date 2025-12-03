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
  language: 'en' | 'ko'  | 'ja' | 'zh-CN' | 'zh-TW';
  onClickPost: (event: MouseEvent<HTMLAnchorElement>, postId: number) => void;
}

export default function PostCard({
  post,
  authorPresentation,
  formattedDate,
  commentCount,
  likeCount,
  language,
  onClickPost,
}: PostCardProps) {
  return (
    <div
      className="block px-5 py-3 !border-2 !border-solid !border-gray-200 rounded-lg hover:!border-pink-300 hover:shadow-md transition-all bg-white"
    >
      <Link
        href={`/community/post/${post.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onClick={(event) => onClickPost(event, post.id)}
      >
        <div className="flex flex-col">
          {/* 카테고리 뱃지 */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {post.topic && (
              <span className="bg-blue-100 text-white px-2 py-1 rounded text-xs">
                {typeof post.topic.name === 'string' ? post.topic.name : post.topic.name[language]}
              </span>
            )}
            {post.tag && (
              <span className="bg-green-700 text-white px-2 py-1 rounded text-xs">
                {typeof post.tag.name === 'string' ? post.tag.name : post.tag.name[language]}
              </span>
            )}

            {/* 작성자, 날짜 */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1 ml-auto">
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
          </div>
          

          {/* 제목과 내용 */}
          <h3 className="text-lg font-semibold text-gray-900">
            {post.title}
          </h3>
          <p className="text-gray-600 line-clamp-2 mb-3">{post.content}</p>

          {/* 통계: 조회수, 댓글, 좋아요 */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto pt-2 border-t border-gray-100">
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
  );
}
