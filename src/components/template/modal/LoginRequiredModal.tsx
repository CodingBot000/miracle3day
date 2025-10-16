'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Button from '@/components/atoms/button/Button'
import { useCookieLanguage } from '@/hooks/useCookieLanguage'

interface LoginRequiredModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function LoginRequiredModal({
  open,
  onConfirm,
  onCancel,
}: LoginRequiredModalProps) {
  const { language } = useCookieLanguage()
  const isKorean = language === 'ko' ? 'ko' : 'en'

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm sm:rounded-xl animate-in fade-in-0 zoom-in-95">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            {isKorean ? '로그인이 필요해요' : 'Login Required'}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 text-center">
          {isKorean
            ? '로그인 해야만 이용할 수 있는 서비스입니다. 로그인 페이지로 이동할까요?'
            : 'You must be logged in to use this service. Would you like to go to the login page?'}
        </p>
        <DialogFooter className="pt-4">
          <div className="flex w-full justify-end gap-3">
            <Button variant="outline" color="white" onClick={onCancel}>
              {isKorean ? '취소' : 'Cancel'}
            </Button>
            <Button color="blue" onClick={onConfirm}>
              {isKorean ? '로그인 페이지로' : 'Go to Login'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
