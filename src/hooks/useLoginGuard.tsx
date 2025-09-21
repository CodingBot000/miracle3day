'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginRequiredModal from '@/components/template/modal/LoginRequiredModal'

export function useLoginGuard(isAuthenticated: boolean) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const requireLogin = useCallback(() => {
    if (isAuthenticated) {
      return true
    }

    setOpen(true)
    return false
  }, [isAuthenticated])

  const modal = useMemo(
    () => (
      <LoginRequiredModal
        open={open}
        onConfirm={() => {
          setOpen(false)
          router.push('/auth/login')
        }}
        onCancel={() => setOpen(false)}
      />
    ),
    [open, router]
  )

  return {
    requireLogin,
    loginModal: modal,
  }
}

