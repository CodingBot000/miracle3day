'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { CommunityCategory } from '@/app/models/communityData.dto'

interface CategoryNavProps {
  categories: CommunityCategory[]
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const searchParams = useSearchParams()
  const fallbackCategoryId = categories[0]?.id ?? ''
  const currentCategoryId = searchParams.get('category') ?? fallbackCategoryId

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = category.id === currentCategoryId
        const href = `/community?category=${encodeURIComponent(category.id)}`

        return (
          <Link
            key={category.id}
            href={href}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </Link>
        )
      })}
    </div>
  )
}
