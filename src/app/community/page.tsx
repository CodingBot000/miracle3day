import Link from 'next/link'
import { getCommunityPostsDTO } from '@/app/api/community/getPosts'

// async function getPosts() {
//   const supabase = createClient()
//   const { data, error } = await supabase
//     .from('community_posts')
//     .select(`
//       *,
//       author:members(nickname),
//       category:community_categories(name),
//       comments_count:community_comments(count),
//       likes_count:community_likes(count)
//     `)
//     .eq('is_deleted', false)
//     .order('created_at', { ascending: false })
  
//   console.log('community post data:', data);
//   if (error) {
//     console.error('Error fetching posts:', error)
//     return []
//   }
  
//   return data || []
// }


export default async function HomePage() {
  const { posts, commentsCount, likesCount } = await getCommunityPostsDTO()

  const commentCountMap = new Map<number, number>(
    commentsCount.map(({ id_post, count }) => [id_post, count])
  )
  const likeCountMap = new Map<number, number>(
    likesCount.map(({ id_post, count }) => [id_post, count])
  )

  const enrichedPosts = posts.map((post) => ({
    ...post,
    comments_count: commentCountMap.get(post.id) ?? 0,
    likes_count: likeCountMap.get(post.id) ?? 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Community Posts</h2>
        <Link
          href="/community/write"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Write Post
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {enrichedPosts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No posts yet.
            </div>
          ) : (
            enrichedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/community/post/${post.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      {post.category && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {post.category.name}
                        </span>
                      )}
                      <span>{post.author?.nickname || 'Anonymous'}</span>
                      <span>·</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
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
                      <span>{post.comments_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>❤️</span>
                      <span>{post.likes_count}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
