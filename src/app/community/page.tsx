import { cookies } from "next/headers";
import { getCommunityCategories, getCommunityPostsDTO } from '@/app/api/community/getPosts';
import type { CommunityCategory } from '@/app/models/communityData.dto';
import PostList from './PostList';
import WritePostButton from './WritePostButton';
import QuestionList from './questions/QuestionList';
import DailyMission from './questions/DailyMission';
import { Suspense } from 'react';

interface CommunityPageProps {
  searchParams?: {
    view?: 'posts' | 'questions';  // 추가: 탭 구분
    topic?: string;
    tag?: string;
  }
}

export default async function HomePage({ searchParams }: CommunityPageProps) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("app_session");
  const isAuthenticated = !!sessionCookie;

  // Get language from cookie
  const languageCookie = cookieStore.get('language');
  const language = (languageCookie?.value as 'ko' | 'en') || 'ko';

  // 기본값: posts
  const currentView = searchParams?.view || 'posts';
  const topicId = searchParams?.topic;
  const tagId = searchParams?.tag;

  // Questions 뷰일 때
  if (currentView === 'questions') {
    return (
      <div className="space-y-6">
        {/* 탭 네비게이션 */}
        <div className="flex gap-2 border-b border-gray-200">
          <a
            href="/community?view=posts"
            className="px-6 py-3 text-gray-600 hover:text-gray-900 transition"
          >
            {language === 'ko' ? '📝 게시판' : '📝 Posts'}
          </a>
          <a
            href="/community?view=questions"
            className="px-6 py-3 text-pink-600 border-b-2 border-pink-600 font-semibold"
          >
            {language === 'ko' ? '💬 데일리 질문' : '💬 Daily Questions'}
          </a>
        </div>

        {/* Daily Questions */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-xl mb-6" />}>
          <DailyMission />
        </Suspense>

        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-xl" />}>
          <QuestionList category={topicId} format={tagId} />
        </Suspense>
      </div>
    );
  }

  // Posts 뷰 (기존 코드)
  const categories = await getCommunityCategories();
  const categoryMap = new Map<string, CommunityCategory>(
    categories.map((category) => [category.id, category])
  );

  // topic과 tag 파라미터 처리

  // getPosts 호출 (topic과 tag 모두 전달)
  const { posts, commentsCount, likesCount } = await getCommunityPostsDTO(topicId, tagId);

  const commentCountMap = new Map<number, number>(
    commentsCount.map(({ id_post, count }) => [id_post, count])
  );
  const likeCountMap = new Map<number, number>(
    likesCount.map(({ id_post, count }) => [id_post, count])
  );

  const enrichedPosts = posts.map((post) => ({
    ...post,
    comment_count: commentCountMap.get(post.id) ?? 0,
    like_count: likeCountMap.get(post.id) ?? 0,
    topic: post.topic_id ? categoryMap.get(post.topic_id) : undefined,     // ← id_category → topic_id
    tag: post.post_tag ? categoryMap.get(post.post_tag) : undefined,       // ← 새로 추가
  }));

  // Helper function to get display name based on language
  const getDisplayName = (name: string | { en: string; ko: string } | null | undefined): string | null => {
    if (!name) return null;
    if (typeof name === 'string') return name;
    return name[language] || name.ko || name.en || null;
  };

  // 헤더 라벨 결정
  let headerLabel = language === 'ko' ? '커뮤니티 게시글' : 'Community Posts';
  if (topicId) {
    const topicCategory = categoryMap.get(topicId);
    const topicName = getDisplayName(topicCategory?.name);
    headerLabel = topicName ? `${topicName} ${language === 'ko' ? '게시글' : 'Posts'}` : headerLabel;
  }
  if (tagId) {
    const tagCategory = categoryMap.get(tagId);
    const tagName = getDisplayName(tagCategory?.name);
    headerLabel = tagName
      ? (topicId ? `${headerLabel} - ${tagName}` : `${tagName} ${language === 'ko' ? '게시글' : 'Posts'}`)
      : headerLabel;
  }

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-gray-200">
        <a
          href="/community?view=posts"
          className="px-6 py-3 text-pink-600 border-b-2 border-pink-600 font-semibold"
        >
          {language === 'ko' ? '📝 게시판' : '📝 Posts'}
        </a>
        <a
          href="/community?view=questions"
          className="px-6 py-3 text-gray-600 hover:text-gray-900 transition"
        >
          {language === 'ko' ? '💬 데일리 질문' : '💬 Daily Questions'}
        </a>
      </div>

      {/* Posts 목록 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{headerLabel}</h2>
        <WritePostButton isAuthenticated={isAuthenticated} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <PostList posts={enrichedPosts} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  );
}