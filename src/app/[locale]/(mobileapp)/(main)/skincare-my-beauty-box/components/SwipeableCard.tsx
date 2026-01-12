'use client';

import { useState, useRef, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import StatusChangeMenu from './StatusChangeMenu';
import { ProductStatus } from '../types';

interface SwipeableCardProps {
  children: React.ReactNode;
  status: ProductStatus;
  onDelete: () => void;
  onStatusChange: (newStatus: ProductStatus) => void;
  locale?: string;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = 150;

export default function SwipeableCard({
  children,
  status,
  onDelete,
  onStatusChange,
  locale = 'ko',
  disabled = false,
}: SwipeableCardProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = swipeX;
    setIsSwiping(true);
  }, [disabled, swipeX]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping || disabled) return;

    const diff = e.touches[0].clientX - startXRef.current;
    let newX = currentXRef.current + diff;

    // 스와이프 제한
    // 왼쪽 스와이프 (삭제): 최대 -MAX_SWIPE
    // 오른쪽 스와이프 (상태 변경): 최대 MAX_SWIPE (used 상태가 아닐 때만)
    if (newX < -MAX_SWIPE) newX = -MAX_SWIPE;
    if (status === 'used') {
      // used 상태는 오른쪽 스와이프 비활성화
      if (newX > 0) newX = 0;
    } else {
      if (newX > MAX_SWIPE) newX = MAX_SWIPE;
    }

    setSwipeX(newX);
  }, [isSwiping, disabled, status]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    setIsSwiping(false);

    // threshold 이상이면 열린 상태 유지, 아니면 닫기
    if (swipeX < -SWIPE_THRESHOLD) {
      setSwipeX(-MAX_SWIPE);
    } else if (swipeX > SWIPE_THRESHOLD && status !== 'used') {
      setSwipeX(MAX_SWIPE);
    } else {
      setSwipeX(0);
    }
  }, [isSwiping, swipeX, status]);

  const handleDelete = useCallback(() => {
    setSwipeX(0);
    onDelete();
  }, [onDelete]);

  const handleStatusChange = useCallback((newStatus: ProductStatus) => {
    setSwipeX(0);
    onStatusChange(newStatus);
  }, [onStatusChange]);

  const closeSwipe = useCallback(() => {
    setSwipeX(0);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* 왼쪽 스와이프: 삭제 버튼 (오른쪽에 노출) */}
      <div
        className="absolute inset-y-0 right-0 flex items-center bg-red-500"
        style={{ width: MAX_SWIPE }}
      >
        <button
          onClick={handleDelete}
          className="w-full h-full flex flex-col items-center justify-center text-white"
        >
          <Trash2 className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">
            {locale === 'ko' ? '삭제' : 'Delete'}
          </span>
        </button>
      </div>

      {/* 오른쪽 스와이프: 상태 변경 메뉴 (왼쪽에 노출) */}
      {status !== 'used' && (
        <div
          className="absolute inset-y-0 left-0 flex items-stretch"
          style={{ width: MAX_SWIPE }}
        >
          <StatusChangeMenu
            currentStatus={status}
            onSelect={handleStatusChange}
            locale={locale}
          />
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div
        className={`relative bg-white ${isSwiping ? '' : 'transition-transform duration-200'}`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={swipeX !== 0 ? closeSwipe : undefined}
      >
        {children}
      </div>
    </div>
  );
}
