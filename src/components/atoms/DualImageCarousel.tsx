"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

type Props = {
  images: string[];
  intervalMs?: number;
  className?: string;
  rounded?: string;
};

export default function DualImageCarousel({
  images,
  intervalMs = 3500,
  className,
  rounded = "rounded-xl",
}: Props) {
  const [pairIndex, setPairIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const timerRef = useRef<number | null>(null);

  // 이미지 프리로드
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  // 타이머 설정
  useEffect(() => {
    stop();
    timerRef.current = window.setInterval(() => {
      setPairIndex((prev) => (prev + 1) % images.length);
    }, intervalMs) as unknown as number;
    return stop;
  }, [images.length, intervalMs]);

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 현재 표시할 2개 이미지 페어 계산
  const getCurrentImagePair = () => {
    const firstIndex = pairIndex;
    const secondIndex = (pairIndex + 1) % images.length;
    return [images[firstIndex], images[secondIndex]];
  };

  // Ken Burns 애니메이션 variants
  const variants = useMemo(
    () => ({
      enter: { opacity: 0, scale: prefersReducedMotion ? 1 : 1.0 },
      center: {
        opacity: 1,
        scale: prefersReducedMotion ? 1 : 1.06,
        transition: {
          opacity: { duration: 0.8, ease: "easeInOut" },
          scale: { duration: intervalMs / 1000, ease: "linear" },
        },
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.8, ease: "easeInOut" },
      },
    }),
    [intervalMs, prefersReducedMotion]
  );

  const currentPair = getCurrentImagePair();

  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-neutral-100",
        rounded,
        className
      )}
      aria-roledescription="image carousel"
    >
      <div className="flex h-full">
        {/* 왼쪽 이미지 */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={`left-${pairIndex}`}
              src={currentPair[0]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              initial="enter"
              animate="center"
              exit="exit"
              variants={variants}
              draggable={false}
            />
          </AnimatePresence>
        </div>

        {/* 오른쪽 이미지 */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={`right-${pairIndex}`}
              src={currentPair[1]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              initial="enter"
              animate="center"
              exit="exit"
              variants={variants}
              draggable={false}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}