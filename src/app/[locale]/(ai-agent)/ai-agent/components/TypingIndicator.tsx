'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  text: string;
  showSteps?: boolean;
}

// AI Agent 처리 단계
const LOADING_STEPS = [
  { textKo: '질문 분석 중...', textEn: 'Analyzing question...' },
  { textKo: '데이터 검색 중...', textEn: 'Searching data...' },
  { textKo: '답변 생성 중...', textEn: 'Generating answer...' },
];

export default function TypingIndicator({ text, showSteps = true }: TypingIndicatorProps) {
  const [stepIndex, setStepIndex] = useState(0);

  // 2초마다 다음 단계로 전환
  useEffect(() => {
    if (!showSteps) return;

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [showSteps]);

  const currentStep = LOADING_STEPS[stepIndex];
  const isKorean = text.includes('중');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-blue-100">
        <div className="flex items-center gap-3">
          {/* Bouncing Dots */}
          <div className="flex gap-1">
            <span
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>

          {/* Step Indicator */}
          {showSteps ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {isKorean ? currentStep.textKo : currentStep.textEn}
              </span>
            </div>
          ) : (
            <span className="text-sm">{text}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
