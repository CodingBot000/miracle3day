// api/community.ts
import { createClient } from '@/utils/supabase/server'
import type {
  CommunityCategory,
  CommunityPost,
  CommunityPostsDTO,
  CountRow,
} from '@/app/models/communityData.dto'

export async function getCommunityPostsDTO(categoryId?: string): Promise<CommunityPostsDTO> {
  const supabase = createClient()

  let query = supabase
    .from('community_posts')
    .select(
      'id, uuid_author, title, content, id_category, view_count, is_deleted, created_at, updated_at, author_name_snapshot, author_avatar_snapshot'
    )
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (categoryId) {
    query = query.eq('id_category', categoryId)
  }
  
  const { data: posts, error: postError } = await query

  if (postError) {
    console.error('Error fetching posts:', postError)
    return { posts: [], commentsCount: [], likesCount: [] }
  }

  const postList = (posts ?? []) as CommunityPost[]
  if (postList.length === 0) {
    return { posts: [], commentsCount: [], likesCount: [] }
  }

  const normalizedPosts = postList.map((post) => ({
    ...post,
    comment_count: post.comment_count ?? 0,
    like_count: post.like_count ?? 0,
    comments_count: post.comment_count ?? post.comment_count ?? 0,
    likes_count: post.like_count ?? post.like_count ?? 0,
  })) as CommunityPost[]

  const commentsCount: CountRow[] = normalizedPosts.map((post) => ({
    id_post: post.id,
    count: post.comment_count ?? post.comment_count ?? 0,
  }))

  const likesCount: CountRow[] = normalizedPosts.map((post) => ({
    id_post: post.id,
    count: post.like_count ?? post.like_count ?? 0,
  }))

  return {
    posts: normalizedPosts,
    commentsCount,
    likesCount,
  }
}

export async function getCommunityCategories(): Promise<CommunityCategory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('community_categories')
    .select('id, name, description, order_index, is_active')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return (data ?? []) as CommunityCategory[]
}
