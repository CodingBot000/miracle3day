import { redirect } from 'next/navigation'
import { createClient } from '@/utils/session/server'
import WriteForm from '@/components/molecules/WriteForm'
import type { Member, CommunityCategory } from '@/app/models/communityData.dto'
import { TABLE_MEMBERS } from '@/constants/tables'

async function getCurrentUser(): Promise<Member | null> {
  const backendClient = createClient()
  const { data: { user } } = await backendClient.auth.getUser()
  
  if (!user) return null
  
  const { data: memberData } = await backendClient
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

async function getCategories() {
  const backendClient = createClient()
  const { data, error } = await backendClient
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

export default async function WritePage() {
  const currentUser = await getCurrentUser()
  console.log('WritePage: ' , currentUser);
  if (!currentUser) {
    redirect(getLoginUrl())
  }

  const categories = await getCategories()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Write New Post</h1>
        <WriteForm 
          authorUuid={currentUser.uuid}
          categories={categories}
        />
      </div>
    </div>
  )
}
