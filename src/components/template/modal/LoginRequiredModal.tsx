'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Button from '@/components/atoms/button/Button'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('Auth')
  const tCommon = useTranslations('Common')

  return (
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
            <Button color="blue" onClick={onConfirm}>
              {t('goToLogin')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
