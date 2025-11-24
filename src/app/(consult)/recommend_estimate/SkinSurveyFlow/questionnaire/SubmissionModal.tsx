import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';

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
  const language = useCookieLanguage();

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
                  ( language === 'ko' ? "제출이 완료되었습니다. 감사합니다." 
                  : "Thank you for your submission.");  
                </p>
                <p className="text-sm text-gray-600">
  
                  ( language === 'ko' ?
                  "작성해주신 문진을 분석하여 AI 알고리즘이 맞춤형 시술 추천과 예상 비용을 제시합니다. \n진행 버튼을 눌러주세요."
                  : "Your responses will now be analyzed,\nand our AI algorithm will provide personalized treatment recommendations and estimated costs.\nPlease press continue."
                ); 
  
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