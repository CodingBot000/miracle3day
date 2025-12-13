'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useCallback, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Share2 } from 'lucide-react'
import { BackButton } from '@/components/BackButton'

interface CommunityDetailLayoutProps {
  children: ReactNode
}

export default function CommunityDetailLayout({ children }: CommunityDetailLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  // write, edit 페이지에서는 Share 버튼 숨김
  const isWriteOrEditPage = pathname?.includes('/write') || pathname?.includes('/edit')
  const showShareButton = !isWriteOrEditPage

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

  // Share 핸들러
  const handleShare = useCallback(async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      const messages: Record<string, string> = {
        ko: '공유 가능한 주소를 클립보드에 복사했습니다.',
        en: 'Shareable link copied to clipboard.',
        ja: '共有可能なリンクをクリップボードにコピーしました。',
        'zh-CN': '已将可分享的链接复制到剪贴板。',
        'zh-TW': '已將可分享的連結複製到剪貼簿。',
      }
      toast.success(messages[locale] || messages.en)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }, [locale])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button and share */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
           <BackButton  />
          {/* <button
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
          </button> */}
          {showShareButton && (
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main content - full width */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
