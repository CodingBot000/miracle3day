'use client';

import { useState } from 'react';
import Link from 'next/link';
import LikeButton from '@/components/atoms/button/LikeButton';
import ReportButton from '@/components/atoms/button/ReportButton';
import { CommunityPost } from '@/app/models/communityData.dto';
import { ANONYMOUS_FALLBACK } from '@/utils/community';

// Image Gallery Component with Modal (images are already full URLs)
function ImageGallery({ images }: { images: string[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 my-4">
        {images.map((imageUrl, idx) => (
          <div
            key={idx}
            className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() => openModal(idx)}
          >
            <img
              src={imageUrl}
              alt={`Image ${idx + 1}`}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeModal}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
            onClick={closeModal}
          >
            ×
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white text-4xl hover:text-gray-300 p-2"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
              >
                ‹
              </button>
              <button
                className="absolute right-4 text-white text-4xl hover:text-gray-300 p-2"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
              >
                ›
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          <div className="absolute bottom-4 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

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
            <span className="bg-blue-100 text-white px-3 py-1 rounded-full text-sm md:text-base">
              {post.topic_icon && `${post.topic_icon} `}{topicName}
            </span>
          )}
          {tagName && (
            <span className="bg-green-100 text-white px-3 py-1 rounded-full text-sm md:text-base">
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
        <span className="block h-7 w-7 overflow-hidden rounded-full bg-gray-200">
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
      <h1 className="text-xl md:text-2xl font-bold mb-1">{post.title}</h1>
      <div className="prose max-w-none mb-2">
        <p className="whitespace-pre-wrap text-sm md:text-base">{post.content}</p>
      </div>

      {/* Image Gallery */}
      {post.images && post.images.length > 0 && (
        <ImageGallery images={post.images} />
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialLiked={hasUserLiked}
            initialCount={likeCount}
            isAuthenticated={isAuthenticated}
          />
          <div className="flex items-center gap-1 text-xs md:text-sm  text-gray-500">
            <span>👁</span>
            <span>{viewCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs md:text-sm  text-gray-500">
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
