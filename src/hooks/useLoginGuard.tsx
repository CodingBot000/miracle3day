'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useNavigation } from '@/hooks/useNavigation'
import LoginRequiredModal from '@/components/template/modal/LoginRequiredModal'

export function useLoginGuard() {
  const { navigate } = useNavigation()
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
    const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`

    return (
      <LoginRequiredModal
        open={open}
        onConfirm={() => {
          setOpen(false)
          navigate(loginUrl)
        }}
        onCancel={() => setOpen(false)}
      />
    )
  }, [open, navigate, pathname, searchParams])

  return {
    requireLogin,
    loginModal: modal,
  }
}

