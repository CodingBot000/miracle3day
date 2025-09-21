'use client'

import { useRouter } from 'next/navigation'
import { useLoginGuard } from '@/hooks/useLoginGuard'

interface WritePostButtonProps {
  isAuthenticated: boolean
}

export default function WritePostButton({ isAuthenticated }: WritePostButtonProps) {
  const router = useRouter()
  const { requireLogin, loginModal } = useLoginGuard(isAuthenticated)

  const handleClick = () => {
    if (!requireLogin()) {
      return
    }

    router.push('/community/write')
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Write Post
      </button>
      {loginModal}
    </>
  )
}

