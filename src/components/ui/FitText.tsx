'use client';

import React, { useRef, useEffect, useState, ReactNode } from 'react';

interface FitTextProps {
  children: ReactNode;
  className?: string;
  minFontSize?: number; // 최소 폰트 크기 (px)
  maxFontSize?: number; // 최대 폰트 크기 (px)
}

/**
 * 컨테이너 너비에 맞게 폰트 크기를 자동 조절하는 컴포넌트
 * 텍스트가 잘리거나 줄바꿈되지 않고 한 줄에 맞게 조절됨
 */
export function FitText({
  children,
  className = '',
  minFontSize = 12,
  maxFontSize = 32
}: FitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const adjustFontSize = () => {
      const container = containerRef.current;
      const text = textRef.current;

      if (!container || !text) return;

      // 최대 크기로 시작
      let currentSize = maxFontSize;
      text.style.fontSize = `${currentSize}px`;

      // 컨테이너 너비 가져오기
      const containerWidth = container.offsetWidth;

      // 텍스트가 컨테이너에 맞을 때까지 폰트 크기 줄이기
      while (text.scrollWidth > containerWidth && currentSize > minFontSize) {
        currentSize -= 0.5;
        text.style.fontSize = `${currentSize}px`;
      }

      setFontSize(currentSize);
    };

    // 초기 조절
    adjustFontSize();

    // 리사이즈 이벤트 핸들러
    const resizeObserver = new ResizeObserver(() => {
      adjustFontSize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [children, minFontSize, maxFontSize]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <span
        ref={textRef}
        className="whitespace-nowrap block"
        style={{ fontSize: `${fontSize}px` }}
      >
        {children}
      </span>
    </div>
  );
}

export default FitText;
