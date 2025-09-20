'use client'

import { useEffect, type ReactNode } from 'react'
import { useCommunityHeader } from './CommunityLayoutShell'

interface SetCommunityHeaderProps {
  children: ReactNode
}

export default function SetCommunityHeader({ children }: SetCommunityHeaderProps) {
  const { setHeaderContent } = useCommunityHeader()

  useEffect(() => {
    setHeaderContent(children)

    return () => {
      setHeaderContent(null)
    }
  }, [children, setHeaderContent])

  return null
}
