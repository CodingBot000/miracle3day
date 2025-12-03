'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useCallback, type ReactNode } from 'react'

interface CommunityDetailLayoutProps {
  children: ReactNode
}

export default function CommunityDetailLayout({ children }: CommunityDetailLayoutProps) {
  const router = useRouter()
  const locale = useLocale()

  const handleBack = useCallback(() => {
    // 1. 먼저 window.close() 시도 (Android 웹뷰에서 동작)
    // target="_blank"로 열린 탭을 닫으려는 시도
    try {
      window.close()
    } catch (e) {
      // ignore
    }

    // 2. window.close()가 실패하면 (일반 브라우저에서) 폴백
    // 약간의 딜레이 후에도 창이 열려있으면 커뮤니티로 이동
    setTimeout(() => {
      // 창이 아직 열려있으면 (close가 실패한 경우)
      router.push('/community')
    }, 100)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {/* <span className="font-medium">
              {locale === 'ko' ? '뒤로가기' : 'Back'}
            </span> */}
          </button>
        </div>
      </header>

      {/* Main content - full width */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
