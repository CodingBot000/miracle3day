import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import CommentSection from '@/components/molecules/CommentSection'
import LikeButton from '@/components/atoms/button/LikeButton'
import ReportButton from '@/components/atoms/button/ReportButton'
import { Member } from '@/app/models/communityData.dto'

async function getCurrentUser(): Promise<Member | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: memberData } = await supabase
    .from('members')
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

async function getPost(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      author:members(nickname),
      category:community_categories(name)
    `)
    .eq('id', id)
    .eq('is_deleted', false)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data
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
    redirect('/')
  }

  const comments = await getComments(params.id)
  const isAuthor = currentUser.uuid === post.uuid_author

  const supabase = createClient()
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {post.category && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {post.category.name}
                </span>
              )}
              <span className="text-gray-500 text-sm">
                {post.author?.nickname || 'Anonymous'} · {new Date(post.created_at).toLocaleDateString()}
              </span>
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
                initialCount={likesCount || 0}
                userId={currentUser.uuid}
              />
              <div className="flex items-center gap-1 text-gray-500">
                <span>👁</span>
                <span>{post.view_count}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <span>💬</span>
                <span>{comments.length}</span>
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
          comments={comments}
          currentUser={currentUser}
        />
      </div>
    </div>
  )
}