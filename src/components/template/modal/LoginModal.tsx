'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import { usePlatform } from '@/hooks/usePlatform'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  redirectUrl: string
}

export default function LoginModal({ open, onClose, redirectUrl }: LoginModalProps) {
  const locale = useLocale()
  const { isAndroidWebView } = usePlatform()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = () => {
    // Android WebView에서는 네이티브 Google Sign-In 사용
    if (isAndroidWebView && window.AndroidBridge?.requestGoogleLogin) {
      console.log('Android WebView: requesting native Google login')
      setIsLoading(true)
      window.AndroidBridge.requestGoogleLogin()
      return
    }

    // 일반 브라우저는 팝업 윈도우로 OAuth 실행
    const oauthUrl = `/api/auth/google/start?state=${encodeURIComponent(redirectUrl)}`
    console.log('Browser: opening OAuth in popup window:', oauthUrl)

    setIsLoading(true)

    // 팝업 윈도우 중앙 위치 계산
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    // 팝업 윈도우 열기
    const popup = window.open(
      oauthUrl,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top},popup=1`
    )

    if (!popup) {
      // 팝업 차단된 경우 - 기존 리다이렉트 방식으로 폴백
      console.warn('Popup blocked, falling back to redirect')
      window.location.replace(oauthUrl)
      return
    }

    // 팝업 완료 감지
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup)
        setIsLoading(false)
        // 팝업이 닫혔으면 모달 닫고 페이지 새로고침하여 세션 업데이트
        console.log('Popup closed, closing modal and reloading')
        onClose()
        window.location.reload()
      }
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-center text-slate-900">
            {locale === 'ko' ? '로그인하여 계속하기' : 'Sign in to continue'}
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            {locale === 'ko'
              ? 'Google 계정으로 클리닉을 탐색하고 예약하세요.'
              : 'Use your Google account to explore clinics and book treatments.'}
          </p>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? (locale === 'ko' ? '로그인 중...' : 'Signing in...')
              : 'Continue with Google'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
