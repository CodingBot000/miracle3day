import { cookies } from "next/headers";
import { getCommunityCategories, getCommunityPostsDTO } from '@/app/api/community/getPosts';
import type { CommunityCategory } from '@/app/models/communityData.dto';
import PostList from './PostList';
import WritePostButton from './WritePostButton';

interface CommunityPageProps {
  searchParams?: {
    category?: string
  }
}

export default async function HomePage({ searchParams }: CommunityPageProps) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("app_session");
  const isAuthenticated = !!sessionCookie;

  const categories = await getCommunityCategories();
  const categoryMap = new Map<string, CommunityCategory>(
    categories.map((category) => [category.id, category])
  );

  const defaultCategoryId = categories[0]?.id;
  const requestedCategoryId = searchParams?.category;
  const selectedCategoryId =
    requestedCategoryId && categoryMap.has(requestedCategoryId)
      ? requestedCategoryId
      : defaultCategoryId;

  const { posts, commentsCount, likesCount } = await getCommunityPostsDTO(selectedCategoryId);

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
    category: post.id_category ? categoryMap.get(post.id_category) : undefined,
  }));

  const activeCategoryLabel = selectedCategoryId
    ? categoryMap.get(selectedCategoryId)?.name
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {activeCategoryLabel ? `${activeCategoryLabel} Posts` : 'Community Posts'}
        </h2>
        <WritePostButton isAuthenticated={isAuthenticated} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <PostList posts={enrichedPosts} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  );
}
