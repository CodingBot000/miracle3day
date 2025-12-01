'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import TooltipInfo, { type TooltipKey } from '@/components/atoms/TooltipInfo';

export function InfoIcon({ kind }: { kind: TooltipKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 모달 열릴 때 body 스크롤 방지, 닫힐 때 복원
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // 스크롤바 너비 계산하여 레이아웃 시프트 방지
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  const Modal = () => (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={closeModal}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" />

      {/* 모달 컨텐츠 */}
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-[90vw] max-h-[90vh] overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          aria-label="close"
          onClick={closeModal}
          className="absolute top-2 right-2 size-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* 툴팁 내용 */}
        <div className="pt-6">
          <TooltipInfo kind={kind} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative inline-block">
      <button
        aria-label="info"
        onClick={() => setIsOpen(true)}
        className="size-5 bg-green-500 rounded-full border flex items-center justify-center text-white text-xs hover:bg-green-600 transition-colors"
      >
        i
      </button>

      {/* 화면 중앙 모달로 표시 */}
      {mounted && isOpen && createPortal(<Modal />, document.body)}
    </div>
  );
}
