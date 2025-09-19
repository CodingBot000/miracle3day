// api/community.ts
import { createClient } from '@/utils/supabase/server'
import type {
  CommunityPost,
  CommunityPostsDTO,
  CountRow,
} from '@/app/models/communityData.dto'

export async function getCommunityPostsDTO(): Promise<CommunityPostsDTO> {
  const supabase = createClient()

  // 1) posts (임베딩/조인 없음)
  const { data: posts, error: postError } = await supabase
    .from('community_posts')
    .select('id, uuid_author, title, content, id_category, view_count, is_deleted, created_at, updated_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (postError) {
    console.error('Error fetching posts:', postError)
    return { posts: [], commentsCount: [], likesCount: [] }
  }

  const postList = (posts ?? []) as CommunityPost[]
  if (postList.length === 0) {
    return { posts: [], commentsCount: [], likesCount: [] }
  }

  const postIds = postList.map(p => p.id)

  // 2) comments 전체를 가져와서 (필요 컬럼만) 프론트에서 count 집계
  //    ※ FK/임베딩 없이도 확실히 동작. 규모 커지면 아래 "성능 개선 팁" 참고.
  const { data: rawComments, error: commentsError } = await supabase
    .from('community_comments')
    .select('id_post, is_deleted')
    .in('id_post', postIds)

  if (commentsError) {
    console.error('Error fetching comments:', commentsError)
  }

  const commentsCountMap = new Map<number, number>()
  for (const row of rawComments ?? []) {
    // 삭제된 댓글은 제외(스키마 기준: is_deleted = true면 제외)
    if (row.is_deleted === true) continue
    const key = row.id_post as number
    commentsCountMap.set(key, (commentsCountMap.get(key) ?? 0) + 1)
  }
  const commentsCount: CountRow[] = postIds.map(id => ({
    id_post: id,
    count: commentsCountMap.get(id) ?? 0,
  }))

  // 3) likes 전체를 가져와서 프론트에서 count 집계
  const { data: rawLikes, error: likesError } = await supabase
    .from('community_likes')
    .select('id_post')
    .in('id_post', postIds)

  if (likesError) {
    console.error('Error fetching likes:', likesError)
  }

  const likesCountMap = new Map<number, number>()
  for (const row of rawLikes ?? []) {
    const key = row.id_post as number
    likesCountMap.set(key, (likesCountMap.get(key) ?? 0) + 1)
  }
  const likesCount: CountRow[] = postIds.map(id => ({
    id_post: id,
    count: likesCountMap.get(id) ?? 0,
  }))

  // 4) DTO 반환
  return {
    posts: postList,
    commentsCount,
    likesCount,
  }
}
