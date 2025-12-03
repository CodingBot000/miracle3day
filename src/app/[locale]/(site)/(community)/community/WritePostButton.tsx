'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useLoginGuard } from '@/hooks/useLoginGuard'

interface WritePostButtonProps {
  isAuthenticated: boolean
}

export default function WritePostButton({ isAuthenticated }: WritePostButtonProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { requireLogin, loginModal } = useLoginGuard()

  const handleClick = () => {
    if (!requireLogin()) {
      return
    }

    // 현재 선택된 토픽과 태그를 URL params로 전달
    const currentTopic = searchParams.get('topic')
    const currentTag = searchParams.get('tag')

    const params = new URLSearchParams()
    if (currentTopic) params.set('defaultTopic', currentTopic)
    if (currentTag) params.set('defaultTag', currentTag)

    const queryString = params.toString()
    const writeUrl = queryString ? `/community/write?${queryString}` : '/community/write'

    router.push(writeUrl)
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

