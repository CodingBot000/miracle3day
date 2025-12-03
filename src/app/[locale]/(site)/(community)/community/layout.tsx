import type { Metadata } from 'next'
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

  try {
    categories = await getCommunityCategories()
  } catch (error) {
    console.error('[CommunityLayout] Failed to fetch categories:', error)
    categories = []
  }

  return (
    <CommunityLayoutShell categories={categories}>
      {children}
    </CommunityLayoutShell>
  )
}
