import { redirect } from 'next/navigation'
import WriteForm from '@/components/molecules/WriteForm'
import { createClient } from '@/utils/supabase/server'
import type { Member, CommunityCategory } from '@/app/models/communityData.dto'
import { TABLE_MEMBERS } from '@/constants/tables'

type CommunityPost = {
  id: number
  title: string
  content: string
  uuid_author: string
  id_category: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
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

async function getPost(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error || !data) {
    return null
  }

  return data as CommunityPost
}

async function getCategories() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('community_categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data as CommunityCategory[]
}

export default async function EditPage({
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

  if (post.uuid_author !== currentUser.uuid) {
    redirect(`/community/post/${params.id}`)
  }

  const categories = await getCategories()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
        <WriteForm
          authorUuid={currentUser.uuid}
          categories={categories}
          initialData={{
            title: post.title,
            content: post.content,
            id_category: post.id_category ? String(post.id_category) : undefined
          }}
          postId={post.id}
        />
      </div>
    </div>
  )
}
