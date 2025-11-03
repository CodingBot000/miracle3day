import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getCommunityCategories } from '@/app/api/community/getPosts'
import CommunityLayoutShell from './CommunityLayoutShell'

export const metadata: Metadata = {
  title: 'Beauty Community',
  description: 'A community for sharing beauty information',
}

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let categories: any[] = []

  // Get language from cookie
  const cookieStore = cookies();
  const langCookie = cookieStore.get("lang");
  const language = langCookie?.value || 'en';

  try {
    categories = await getCommunityCategories(language)
  } catch (error) {
    console.error('[CommunityLayout] Failed to fetch categories:', error)
    // DB 연결 실패시 빈 배열로 계속 진행
    categories = []
  }

  return (
    <CommunityLayoutShell categories={categories}>
      {children}
    </CommunityLayoutShell>
  )
}
