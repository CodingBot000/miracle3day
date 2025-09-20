'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CommunityCategory } from '@/app/models/communityData.dto'
import CategoryNav from './CategoryNav'
import Link from 'next/link'

type CommunityHeaderContextValue = {
  setHeaderContent: (content: ReactNode | null) => void
}

const CommunityHeaderContext = createContext<CommunityHeaderContextValue | undefined>(undefined)

export function useCommunityHeader() {
  const context = useContext(CommunityHeaderContext)

  if (!context) {
    throw new Error('useCommunityHeader must be used within CommunityLayoutShell')
  }

  return context
}

interface CommunityLayoutShellProps {
  categories: CommunityCategory[]
  children: ReactNode
}

export default function CommunityLayoutShell({
  categories,
  children,
}: CommunityLayoutShellProps) {
  const [headerContent, setHeaderContentState] = useState<ReactNode | null>(null)

  const setHeaderContent = useCallback((content: ReactNode | null) => {
    setHeaderContentState(content)
  }, [])

  const contextValue = useMemo(
    () => ({ setHeaderContent }),
    [setHeaderContent],
  )

  return (
    <CommunityHeaderContext.Provider value={contextValue}>
      <div className="min-h-full bg-gray-50 py-8 sm:py-10">
        <div className="bg-white shadow-sm rounded-xl border border-gray-100">
          <header className="border-b border-gray-100 px-6 py-4">
            <Link href="/community">
            <h1 className="text-xl font-semibold text-gray-900">Beauty Community</h1>
            </Link>
            {headerContent ?? <CategoryNav categories={categories} />}
          </header>
          <div className="px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </CommunityHeaderContext.Provider>
  )
}
