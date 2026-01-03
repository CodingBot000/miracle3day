'use client';

import { useState, useCallback } from 'react';
import { Save, Check, AlertCircle } from 'lucide-react';

interface SyncButtonProps {
  pendingCount: number;
  hasUnsavedChanges: boolean;
  onSync: () => Promise<{ success: boolean; error?: string }>;
  locale?: string;
}

const text = {
  ko: {
    save: '저장',
    saving: '저장 중...',
    saved: '저장됨',
    error: '저장 실패',
    retry: '다시 시도',
  },
  en: {
    save: 'Save',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Save failed',
    retry: 'Retry',
  },
};

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export default function SyncButton({
  pendingCount,
  hasUnsavedChanges,
  onSync,
  locale = 'ko',
}: SyncButtonProps) {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const t = text[locale as keyof typeof text] || text.en;

  const handleSync = useCallback(async () => {
    if (!hasUnsavedChanges || status === 'syncing') return;

    setStatus('syncing');
    const result = await onSync();

    if (result.success) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('error');
    }
  }, [hasUnsavedChanges, status, onSync]);

  // 변경사항 없으면 숨김
  if (!hasUnsavedChanges && status === 'idle') {
    return null;
  }

  const getButtonStyle = () => {
    switch (status) {
      case 'error':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return hasUnsavedChanges
          ? 'bg-pink-500 text-white shadow-lg'
          : 'bg-gray-300 text-gray-600';
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={status === 'syncing'}
      className={`
        fixed right-4 bottom-24 z-40
        px-4 py-3 rounded-full
        flex items-center gap-2
        transition-all duration-200
        ${getButtonStyle()}
        disabled:opacity-70
      `}
    >
      {status === 'syncing' ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">{t.saving}</span>
        </>
      ) : status === 'success' ? (
        <>
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">{t.saved}</span>
        </>
      ) : status === 'error' ? (
        <>
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{t.retry}</span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          <span className="text-sm font-medium">{t.save}</span>
          {pendingCount > 0 && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}
