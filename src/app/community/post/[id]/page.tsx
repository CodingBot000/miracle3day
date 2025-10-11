import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import CommentSection from '@/components/molecules/CommentSection'
import LikeButton from '@/components/atoms/button/LikeButton'
import ReportButton from '@/components/atoms/button/ReportButton'
import { Member, CommunityPost, CommunityComment } from '@/app/models/communityData.dto'
import PostNotFoundFallback from './PostNotFoundFallback'
import SetCommunityHeader from '../../SetCommunityHeader'
import { ANONYMOUS_FALLBACK, isAnonymousCategoryName } from '../../utils'
import { TABLE_MEMBERS } from '@/constants/tables'

function buildCommentTree(comments: CommunityComment[]): CommunityComment[] {
  const commentMap = new Map<number, CommunityComment & { replies: CommunityComment[] }>()
  const roots: CommunityComment[] = []

  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    })
  })

  comments.forEach((comment) => {
    const node = commentMap.get(comment.id)
    if (!node) return

    if (comment.id_parent) {
      const parent = commentMap.get(comment.id_parent)
      if (parent) {
        parent.replies = [...(parent.replies ?? []), node]
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  })

  return roots
}

function countComments(comments: CommunityComment[]): number {
  return comments.reduce((total, comment) => {
    const replies = comment.replies ?? []
    return total + 1 + countComments(replies)
  }, 0)
}

async function getCurrentUser(): Promise<Member | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: memberData } = await supabase
    .from(TABLE_MEMBERS)
    .select('*')
    .eq('uuid', user.id)
    .single()
  
  return memberData || {
    uuid: user.id,
    nickname: user.user_metadata?.nickname || 'Anonymous',
    name: user.user_metadata?.name || '',
    email: user.email || '',
    created_at: user.created_at,
    updated_at: user.updated_at
  }
}

function getLoginUrl() {
  return '/auth/login'
}

async function getPost(id: string): Promise<CommunityPost | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('community_posts')
    .select(
      'id, uuid_author, title, content, id_category, view_count, is_deleted, created_at, updated_at, author_name_snapshot, author_avatar_snapshot'
    )
    .eq('id', id)
    .eq('is_deleted', false)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as CommunityPost
}

async function getComments(postId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('community_comments')
    .select(`
      *,
      author:members(nickname)
    `)
    .eq('id_post', postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }
  
  return data || []
}

export default async function PostDetailPage({
  params
}: {
  params: { id: string }
}) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect(getLoginUrl())
  }

  const post = await getPost(params.id)
  if (!post) {
    return <PostNotFoundFallback />
  }

  const rawComments = await getComments(params.id)
  const commentTree = buildCommentTree(rawComments)
  const totalComments = countComments(commentTree)
  const isAuthor = currentUser.uuid === post.uuid_author

  const supabase = createClient()

  let categoryName: string | null = null

  if (post.id_category) {
    const { data: categoryRow } = await supabase
      .from('community_categories')
      .select('name')
      .eq('id', post.id_category)
      .eq('is_active', true)
      .maybeSingle()

    categoryName = categoryRow?.name ?? null
  }

  const anonymousCategory = isAnonymousCategoryName(categoryName)
  const authorName = anonymousCategory
    ? ANONYMOUS_FALLBACK.name
    : post.author_name_snapshot?.trim() || ANONYMOUS_FALLBACK.name
  const authorAvatar = anonymousCategory
    ? ANONYMOUS_FALLBACK.avatar
    : post.author_avatar_snapshot?.trim() || ANONYMOUS_FALLBACK.avatar

  const formattedCreatedAt = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(new Date(post.created_at))

  const { count: likesCount } = await supabase
    .from('community_likes')
    .select('id', { count: 'exact' })
    .eq('id_post', post.id)

  const { data: userLike } = await supabase
    .from('community_likes')
    .select('id')
    .eq('id_post', post.id)
    .eq('uuid_member', currentUser.uuid)
    .single()

  const likeCountValue = likesCount ?? post.like_count ?? 0
  const nextViewCount = (post.view_count ?? 0) + 1

  await supabase
    .from('community_posts')
    .update({
      view_count: nextViewCount,
      comment_count: totalComments,
      like_count: likeCountValue,
      updated_at: new Date().toISOString(),
    })
    .eq('id', post.id)

  return (
    <div className="max-w-4xl mx-auto">
      <SetCommunityHeader>
        <div className="mt-4">
          <span className="inline-flex px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            {categoryName ?? 'All Posts'}
          </span>
        </div>
      </SetCommunityHeader>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {categoryName && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {categoryName}
                </span>
              )}
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <span className="block h-9 w-9 overflow-hidden rounded-full bg-gray-200">
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
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <LikeButton
                postId={post.id}
                initialLiked={!!userLike}
                initialCount={likeCountValue}
                userId={currentUser.uuid}
              />
              <div className="flex items-center gap-1 text-gray-500">
                <span>👁</span>
                <span>{nextViewCount}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <span>💬</span>
                <span>{totalComments}</span>
              </div>
            </div>
            <ReportButton
              targetType="post"
              targetId={post.id}
              reporterUuid={currentUser.uuid}
            />
          </div>
        </div>

        <CommentSection
          postId={post.id}
          comments={commentTree}
          currentUser={currentUser}
        />
      </div>
    </div>
  )
}
