'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Button from '@/components/atoms/button/Button'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import LoginModal from './LoginModal'
import { usePathname, useSearchParams } from 'next/navigation'

interface LoginRequiredModalProps {
  open: boolean
  onConfirm?: () => void // Deprecated: kept for backward compatibility but no longer used
  onCancel: () => void
}

export default function LoginRequiredModal({
  open,
  onConfirm: _onConfirm, // Prefixed with _ to indicate intentionally unused
  onCancel,
}: LoginRequiredModalProps) {
  const t = useTranslations('Auth')
  const tCommon = useTranslations('Common')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleConfirm = () => {
    // 항상 새로운 방식 사용: LoginModal 열기 (페이지 이동 없음)
    setShowLoginModal(true)
    onCancel() // LoginRequiredModal 닫기

    // onConfirm은 더 이상 사용하지 않음 (하위 호환성을 위해 prop만 유지)
  }

  const handleLoginModalClose = () => {
    setShowLoginModal(false)
  }

  // Build current URL for redirect
  const queryString = searchParams.toString()
  const currentUrl = pathname + (queryString ? `?${queryString}` : '')

  return (
    <>
      <Dialog open={open} onOpenChange={onCancel}>
        <DialogContent className="max-w-sm sm:rounded-xl animate-in fade-in-0 zoom-in-95">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              {t('loginRequired')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 text-center">
            {t('loginRequiredMessage')}
          </p>
          <DialogFooter className="pt-4">
            <div className="flex w-full justify-end gap-3">
              <Button variant="outline" color="white" onClick={onCancel}>
                {tCommon('cancel')}
              </Button>
              <Button color="blue" onClick={handleConfirm}>
                {t('goToLogin')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LoginModal
        open={showLoginModal}
        onClose={handleLoginModalClose}
        redirectUrl={currentUrl}
      />
    </>
  )
}
