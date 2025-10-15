"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";

interface ZoomableImageMapProps {
  imageSrc: string;
  alt?: string;
  className?: string;
}

export default function ZoomableImageMap({ imageSrc, alt = "Map", className = "" }: ZoomableImageMapProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;
  const ZOOM_STEP = 0.3;
  const MOBILE_INITIAL_ZOOM = 1.6; // 모바일에서 + 버튼 2번 누른 효과 (1 + 0.3 + 0.3)

  // 모바일 여부 확인
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768; // md breakpoint
  };

  // 컨테이너 크기 측정 및 모바일 초기 줌 설정
  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        const rect = containerRef.current!.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });

        // 모바일이면 초기 줌 적용
        if (isMobile()) {
          setScale(MOBILE_INITIAL_ZOOM);
        } else {
          setScale(MIN_SCALE);
        }
      };
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // 위치 제한 계산
  const constrainPosition = (newX: number, newY: number, newScale: number) => {
    if (newScale <= MIN_SCALE) {
      return { x: 0, y: 0 };
    }

    const scaledWidth = containerSize.width * newScale;
    const scaledHeight = containerSize.height * newScale;
    const maxX = (scaledWidth - containerSize.width) / 2;
    const maxY = (scaledHeight - containerSize.height) / 2;

    return {
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY))
    };
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale + ZOOM_STEP, MAX_SCALE);
    setScale(newScale);
    const constrained = constrainPosition(position.x, position.y, newScale);
    setPosition(constrained);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - ZOOM_STEP, MIN_SCALE);
    setScale(newScale);
    const constrained = constrainPosition(position.x, position.y, newScale);
    setPosition(constrained);
  };

  // 마우스 드래그
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > MIN_SCALE) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      const constrained = constrainPosition(newX, newY, scale);
      setPosition(constrained);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 터치 드래그
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > MIN_SCALE) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      const constrained = constrainPosition(newX, newY, scale);
      setPosition(constrained);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 핀치 줌 (모바일)
  const lastTouchDistance = useRef<number | null>(null);

  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStartPinch = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastTouchDistance.current = getTouchDistance(e.touches);
      setIsDragging(false);
    } else if (e.touches.length === 1 && scale > MIN_SCALE) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMovePinch = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const delta = currentDistance - lastTouchDistance.current;
      const scaleChange = delta * 0.01;

      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + scaleChange));
      setScale(newScale);
      const constrained = constrainPosition(position.x, position.y, newScale);
      setPosition(constrained);

      lastTouchDistance.current = currentDistance;
    } else if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      const constrained = constrainPosition(newX, newY, scale);
      setPosition(constrained);
    }
  };

  const handleTouchEndPinch = () => {
    lastTouchDistance.current = null;
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[328px] md:h-[528px] rounded-lg overflow-hidden bg-gray-100 ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStartPinch}
      onTouchMove={handleTouchMovePinch}
      onTouchEnd={handleTouchEndPinch}
      style={{ cursor: isDragging ? 'grabbing' : scale > MIN_SCALE ? 'grab' : 'default' }}
    >
      {/* 이미지 */}
      <div
        ref={imageRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          transformOrigin: 'center center',
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover"
          draggable={false}
          priority
        />
      </div>

      {/* 줌 컨트롤 버튼 */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          disabled={scale >= MAX_SCALE}
          className="w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          aria-label="Zoom in"
        >
          <Plus size={20} className="text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={scale <= MIN_SCALE}
          className="w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          aria-label="Zoom out"
        >
          <Minus size={20} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
}
