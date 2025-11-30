'use client';

import { useState, useEffect, useRef } from 'react';
import TooltipInfo, { type TooltipKey } from '@/components/atoms/TooltipInfo';

export function InfoIcon({ kind }: { kind: TooltipKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        aria-label="info"
        onClick={() => setIsOpen(!isOpen)}
        className="size-5 bg-green-500 rounded-full border flex items-center justify-center text-white text-xs hover:bg-green-600 transition-colors"
      >
        i
      </button>
      {/* Click 시 표시되는 레이어 */}
      {isOpen && (
        <div className="absolute z-50 left-0 top-full mt-2 p-3 bg-white shadow-lg rounded-xl min-w-[200px]">
          <TooltipInfo kind={kind} />
        </div>
      )}
    </div>
  );
}
