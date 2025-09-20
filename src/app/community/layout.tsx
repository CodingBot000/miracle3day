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
  const categories = await getCommunityCategories()

  return (
    <CommunityLayoutShell categories={categories}>
      {children}
    </CommunityLayoutShell>
  )
}
