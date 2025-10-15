'use client';

import { useEffect, useCallback } from 'react';

type TermsHtmlModalProps = {
  open: boolean;
  src?: string;            // /public 이하 HTML 경로
  title?: string;
  onClose: () => void;
};

export default function TermsHtmlModal({ open, src, title = 'View', onClose }: TermsHtmlModalProps) {
  // ESC로 닫기
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  // 뒷배경 스크롤 잠금 + ESC 리스너
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Container: 모바일 풀, 데스크톱 중앙 */}
      <div className="absolute inset-0 flex items-stretch sm:items-center sm:justify-center">
        <div className="flex h-[100dvh] w-[100vw] sm:h-[80vh] sm:w-[min(960px,95vw)] flex-col overflow-hidden rounded-none bg-white shadow-xl sm:rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-medium truncate">{title}</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="rounded p-1 hover:bg-gray-100 active:bg-gray-200"
            >
              {/* × 아이콘 */}
              <span className="block text-xl leading-none">×</span>
            </button>
          </div>

          {/* Body: 외부 HTML 로드 */}
          <div className="flex-1">
            {src ? (
              <iframe
                src={src}
                title={title}
                className="h-full w-full border-0"
                // 필요 시 sandbox 사용 (동일 출처면 생략 가능)
                // sandbox="allow-same-origin allow-scripts allow-forms"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No content
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
