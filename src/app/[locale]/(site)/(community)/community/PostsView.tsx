import { cookies } from "next/headers";
import { getCommunityCategories, getCommunityPostsDTO } from '@/app/api/community/getPosts';
import type { CommunityCategory } from '@/app/models/communityData.dto';
import PostList from './PostList';
import WritePostButton from './WritePostButton';

interface PostsViewProps {
  topicId?: string;
  tagId?: string;
  language: 'ko' | 'en';
}

export default async function PostsView({ topicId, tagId, language }: PostsViewProps) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("app_session");
  const isAuthenticated = !!sessionCookie;

  // Posts 뷰 (기존 코드)
  const categories = await getCommunityCategories();
  const categoryMap = new Map<string, CommunityCategory>(
    categories.map((category) => [category.id, category])
  );

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
    topic: post.topic_id ? categoryMap.get(post.topic_id) : undefined,
    tag: post.post_tag ? categoryMap.get(post.post_tag) : undefined,
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
      {/* Posts 목록 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{headerLabel}</h2>
        {/* <WritePostButton isAuthenticated={isAuthenticated} /> */}
      </div>

      <div className="bg-white rounded-lg shadow">
        <PostList posts={enrichedPosts} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  );
}
