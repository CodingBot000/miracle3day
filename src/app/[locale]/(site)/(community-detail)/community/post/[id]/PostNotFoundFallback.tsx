'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function PostNotFoundFallback() {
  const router = useRouter()

  useEffect(() => {
    toast.error('Post not found')

    const timeoutId = window.setTimeout(() => {
      if (window.history.length > 1) {
        router.back()
      } else {
        router.replace('/community')
      }
    }, 150)

    return () => window.clearTimeout(timeoutId)
  }, [router])

  return null
}
