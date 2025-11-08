'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import LoginRequiredModal from '@/components/template/modal/LoginRequiredModal'

export function useLoginGuard(isAuthenticated: boolean) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const requireLogin = useCallback(() => {
    if (isAuthenticated) {
      return true
    }

    setOpen(true)
    return false
  }, [isAuthenticated])

  const modal = useMemo(() => {
    // Build current URL with query params for redirect
    const queryString = searchParams.toString()
    const currentUrl = pathname + (queryString ? `?${queryString}` : '')
    const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentUrl)}`

    return (
      <LoginRequiredModal
        open={open}
        onConfirm={() => {
          setOpen(false)
          router.push(loginUrl)
        }}
        onCancel={() => setOpen(false)}
      />
    )
  }, [open, router, pathname, searchParams])

  return {
    requireLogin,
    loginModal: modal,
  }
}

