"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

type Props = {
  images: string[];            // 5장 이상도 지원
  intervalMs?: number;         // 기본 4000ms
  className?: string;          // 사이즈/레이아웃 커스텀
  rounded?: string;            // Tailwind rounded 값 (예: "rounded-2xl")
};

export default function FadeKenBurnsCarousel({
  images,
  intervalMs = 3000,          // 모바일에서 조금 더 빠르게
  className,
  rounded = "rounded-xl",
}: Props) {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const timerRef = useRef<number | null>(null);

  // 간단 프리로드 (깜빡임 방지)
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  useEffect(() => {
    stop();
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs) as unknown as number;
    return stop;
  }, [images.length, intervalMs]);

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Ken Burns: 느린 줌(1.0 → 1.06) + 페이드(0.8s)
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

  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-neutral-100",
        rounded,
        className
      )}
      aria-roledescription="carousel"
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial="enter"
          animate="center"
          exit="exit"
          variants={variants}
          draggable={false}
        />
      </AnimatePresence>

      {/* 선택적: 하단 인디케이터 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <span
            key={i}
            className={clsx(
              "h-1.5 w-1.5 rounded-full transition-opacity",
              i === index ? "bg-white/90" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}