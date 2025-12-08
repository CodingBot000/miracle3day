import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { submitModal } from '@/app/[locale]/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_preview_result';
import { useLocale } from 'next-intl';
import { getLocalizedText } from '@/utils/i18n';

interface SubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  isCompleted: boolean;
  onComplete: () => void;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  isCompleted,
  onComplete
}) => {
  const locale = useLocale();

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {isSubmitting ? (
            <>
              {/* 로딩 상태 */}
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getLocalizedText(submitModal.submitting.title, locale)}
                </h3>
                <p className="text-sm text-gray-600">
                  {getLocalizedText(submitModal.submitting.desc, locale)}
                </p>
              </div>
            </>
          ) : isCompleted ? (
            <>
              {/* 완료 상태 */}
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
             <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getLocalizedText(submitModal.completed.title, locale)}
                </h3>
                <p className="text-sm text-gray-600">
                  {getLocalizedText(submitModal.completed.desc1, locale)}
                </p>
                <p className="text-sm text-gray-600">
                  {getLocalizedText(submitModal.completed.desc2, locale)}
                </p>
                <p className="text-sm text-gray-600">
                  {getLocalizedText(submitModal.completed.desc3, locale)}
                </p>
                <p className="text-sm text-gray-600 pt-2 border-t border-gray-200 mt-2">
                  {getLocalizedText(submitModal.completed.desc4, locale)}
                </p>
              </div>
              <Button
                onClick={onComplete}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-6 py-2 rounded-full"
              >
                {getLocalizedText(submitModal.confirmButton, locale)}
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionModal;