"use client";

import { useEffect } from "react";
import { Check, Copy } from "lucide-react";

interface CopyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainString: string;
  subDescString?: string;
}

const CopyAlertModal = ({
  isOpen,
  onClose,
  mainString,
  subDescString = "The ID has been copied. Now you can go to the messenger and add it by pasting."
}: CopyAlertModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center pt-8 pb-6 px-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>

            <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
            Copied Successfully!
          </h3>

          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-500 uppercase">Copied ID</span>
            </div>
            <p className="text-base font-mono font-semibold text-gray-900 break-all">
              {mainString}
            </p>
          </div>

          {subDescString && (
            <p className="text-sm text-gray-600 text-center leading-relaxed mb-6 px-2">
              {subDescString}
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            Confirm
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CopyAlertModal;
