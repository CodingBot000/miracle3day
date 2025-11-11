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
  const isEnglish = language === 'en' ? 'en' : 'ko'

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm sm:rounded-xl animate-in fade-in-0 zoom-in-95">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            {isEnglish ? 'Login Required' : '로그인이 필요해요'}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 text-center">
          {isEnglish
            ? 'You must be logged in to use this service. Would you like to go to the login/signup page?'
            : '로그인 해야만 이용할 수 있는 서비스입니다. 로그인/회원가입 페이지로 이동할까요?'}
        </p>
        <DialogFooter className="pt-4">
          <div className="flex w-full justify-end gap-3">
            <Button variant="outline" color="white" onClick={onCancel}>
              {isEnglish ? 'Cancel' : '취소'}
            </Button>
            <Button color="blue" onClick={onConfirm}>
              {isEnglish ? 'Go to Login/Signup' : '로그인/회원가입 페이지로'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
