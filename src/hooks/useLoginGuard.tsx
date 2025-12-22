'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import LoginModal from '@/components/template/modal/LoginModal'

export function useLoginGuard() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          setUser(data.auth)
        } else {
          setUser(null)
        }
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const requireLogin = useCallback(() => {
    if (user && user.status === 'active') {
      return true
    }

    setOpen(true)
    return false
  }, [user])

  const modal = useMemo(() => {
    // Build current URL with query params for redirect
    const queryString = searchParams.toString()
    const currentUrl = pathname + (queryString ? `?${queryString}` : '')

    return (
      <LoginModal
        open={open}
        onClose={() => setOpen(false)}
        redirectUrl={currentUrl}
      />
    )
  }, [open, pathname, searchParams])

  return {
    requireLogin,
    loginModal: modal,
  }
}

