"use client";

import { log } from '@/utils/logger';


import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ANALYSIS_STEPS, SupportedLocale } from "./analysisSteps";

interface AnalysisProgressProps {
  locale?: SupportedLocale;           // "ko" | "en" (기본값 ko)
  delayBetweenStepsMs?: number;       // 기본 500ms
  onComplete?: () => void;            // 마지막 문장까지 끝났을 때 호출
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  locale = "en",
  delayBetweenStepsMs = 500,
  onComplete,
}) => {
  const steps = ANALYSIS_STEPS[locale];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    log.debug('🔍 AnalysisProgress - Current index:', index, '/ Total steps:', steps.length);

    // 마지막 문장까지 도달하면 멈추고 콜백 호출
    if (index >= steps.length - 1) {
      log.debug('✅ Reached end, calling onComplete');
      if (onComplete) onComplete();
      return;
    }

    log.debug('⏱️  Setting timer for', delayBetweenStepsMs, 'ms');
    const timer = setTimeout(() => {
      log.debug('🔥 Timer fired, incrementing index from', index, 'to', index + 1);
      setIndex((prev) => {
        if (prev >= steps.length - 1) return prev; // 안전장치
        return prev + 1;
      });
    }, delayBetweenStepsMs);

    return () => {
      log.debug('🧹 Cleaning up timer for index:', index);
      clearTimeout(timer);
    };
  }, [index, steps.length, delayBetweenStepsMs, onComplete]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-4">
      {/* 상단에 고정된 작은 서브타이틀 (선택사항) */}
      <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
        {locale === "ko" ? "AI 시술 추천 엔진" : "AI Treatment Engine"}
      </p>

      {/* 한 줄만 보이도록 높이 고정 + overflow-hidden */}
      <div className="relative h-6 md:h-7 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ y: 20, opacity: 0 }}   // 아래에서 시작
            animate={{ y: 0, opacity: 1 }}    // 중앙으로
            exit={{ y: -20, opacity: 0 }}     // 위로 사라짐
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="text-sm md:text-base text-slate-700 font-medium whitespace-nowrap"
          >
            {steps[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};