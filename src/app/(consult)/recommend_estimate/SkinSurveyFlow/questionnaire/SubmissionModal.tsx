import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

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
                  Submitting Your Consultation
                </h3>
                <p className="text-sm text-gray-600">
                  Please wait while we process your information...
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
                  Consultation Submitted Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  Thank you for your submission.
                </p>
                <p className="text-sm text-gray-600">
                  Experience the pinnacle of Korean dermatology—personalized elegance, guided by our advanced algorithm.
                </p>
              </div>
              <Button
                onClick={onComplete}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-6 py-2 rounded-full"
              >
                Confirm
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionModal;