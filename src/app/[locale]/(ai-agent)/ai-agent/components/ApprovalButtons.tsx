'use client';

import { motion } from 'framer-motion';

interface ApprovalButtonsProps {
  onApprove: () => void;
  onCancel: () => void;
  onModify: () => void;
  disabled?: boolean;
  labels?: {
    approve: string;
    cancel: string;
    modify: string;
  };
}

export default function ApprovalButtons({
  onApprove,
  onCancel,
  onModify,
  disabled = false,
  labels = {
    approve: '진행',
    cancel: '취소',
    modify: '수정',
  },
}: ApprovalButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center gap-3 py-4"
    >
      <button
        onClick={onApprove}
        disabled={disabled}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {labels.approve}
      </button>

      <button
        onClick={onModify}
        disabled={disabled}
        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {labels.modify}
      </button>

      <button
        onClick={onCancel}
        disabled={disabled}
        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        {labels.cancel}
      </button>
    </motion.div>
  );
}
