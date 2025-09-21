'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Button from '@/components/atoms/button/Button'

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
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm sm:rounded-xl animate-in fade-in-0 zoom-in-95">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Login Required
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 text-center">
          You must be logged in to use this service. Would you like to go to the login page?
        </p>
        <DialogFooter className="pt-4">
          <div className="flex w-full justify-end gap-3">
            <Button variant="outline" color="white" onClick={onCancel}>
              Cancel
            </Button>
            <Button color="blue" onClick={onConfirm}>
              Go to Login
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

