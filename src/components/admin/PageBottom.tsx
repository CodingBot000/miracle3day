'use client';

import React from 'react';
import { Button } from '../ui/button';
import { useFormMode } from '@/contexts/admin/FormModeContext';

interface PageBottomProps {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onPrev?: () => void;
  onNext?: () => void;
  onDraftSave?: () => void;
  onPreview?: () => void;
  onHome?: () => void;
  isSubmitting?: boolean;
  isDraftSaveDisabled?: boolean;
  children?: React.ReactNode; // 설명 텍스트 등
  className?: string;
}

const PageBottom: React.FC<PageBottomProps> = ({
  step,
  onPrev,
  onNext,
  onDraftSave,
  onPreview,
  onHome,
  isSubmitting = false,
  isDraftSaveDisabled = false,
  children,
  className = '',
}) => {
  const { isReadMode } = useFormMode( );
  // 버튼 그룹 렌더링
  const renderButtons = () => {
    switch (step) {
      case 1:
        return (
          <Button
            type="button"
            className="btn btn-primary"
            onClick={onNext}
            disabled={isSubmitting}
            data-allow-interact
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                저장 중
              </>
            ) : (
              isReadMode ? 'Skip saving and continue' : 'Save And Next'
            )}
          </Button>
        );
      case 2:
      case 3:
      
        return (
          <>
            <Button
              type="button"
              className="btn btn-secondary bg-yellow-400"
              onClick={onPrev}
              disabled={isSubmitting}
              data-allow-interact
            >
            Prev
            </Button>
            <Button
              type="button"
              className="btn btn-primary"
              onClick={onNext}
              disabled={isSubmitting}
              data-allow-interact
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  저장 중
                </>
              ) : (
                isReadMode ? 'Skip saving and continue' : 'Save And Next'
              )}
            </Button>
          </>
        );
        case 4:
      case 5:
      case 6:
        return (
          <>
            <Button
              type="button"
              className="btn btn-secondary bg-yellow-400"
              onClick={onPrev}
              disabled={isSubmitting}
              data-allow-interact
            >
            Prev
            </Button>
            <Button
              type="button"
              className="btn btn-primary bg-red-400"
              onClick={onDraftSave}
              disabled={isSubmitting || isDraftSaveDisabled || isReadMode}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  저장 중
                </>
              ) : (
                'Draft Save'
              )}
            </Button>
            <Button
              type="button"
              className="btn btn-primary"
              onClick={onNext}
              disabled={isSubmitting}
              data-allow-interact
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  저장 중
                </>
              ) : (
                isReadMode ? 'Skip saving and continue' : 'Save And Next'
              )}
            </Button>
          </>
        );
      case 7:
        return (
          <>
             <Button
              type="button"
              className="btn btn-secondary bg-yellow-400"
              onClick={onPrev}
              disabled={isSubmitting}
              data-allow-interact
            >
            Prev
            </Button>
            <Button
              type="button"
              className="btn btn-secondary bg-green-600"
              onClick={onPreview}
              disabled={isSubmitting}
              data-allow-interact
            >
            Preview
            </Button>
            <Button
              type="button"
              className="btn btn-primary bg-red-400"
              onClick={onDraftSave}
              disabled={isSubmitting || isDraftSaveDisabled || isReadMode}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  저장 중
                </>
              ) : (
                'Draft Save'
              )}
            </Button>
            <Button
              type="button"
              className="btn btn-accent"
              onClick={onHome}
              disabled={isSubmitting}
              data-allow-interact
            >
            Go to Home
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50 ${className}`}>
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* 왼쪽: 설명/children */}
        <div>{children}</div>
        {/* 오른쪽: 버튼 그룹 */}
        <div className="flex gap-3">{renderButtons()}</div>
      </div>
    </div>
  );
};

export default PageBottom;
