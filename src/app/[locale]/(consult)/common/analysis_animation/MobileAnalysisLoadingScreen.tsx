
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYSIS_STEPS, SupportedLocale } from "../../pre_consultation_intake_form/pre_consultation_intake/analysisSteps";
import TreatmentAnalysisLoading from "./TreatmentAnalysisLoading";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useLocale } from "next-intl";

interface MobileAnalysisLoadingScreenProps {
  locale?: SupportedLocale;              // Optional: will use useLocale() if not provided
  delayBetweenStepsMs?: number;          // 기본 500ms
  onComplete?: () => void;               // 마지막 문장 표시 완료 시
}

const fakeCodeLines = [
  "SELECT * FROM treatments WHERE score > 0.82;",
  "Applying budget and priority weights...",
  "Normalizing skin concern vectors...",
  "Aggregating clinic-specific protocols...",
  "Computing similarity to peer profiles...",
  "Checking contraindications and warnings...",
  "Ranking final treatment candidates...",
];

// Multilingual translations
const TRANSLATIONS = {
  ko: {
    title: "맞춤 시술 플랜 분석 중",
    subtitle: "입력하신 문진 내용을 기반으로 최적의 시술 조합을 찾고 있어요.",
    aiStatus: "AI 분석 진행 중",
    bottomInfo: "피부타입, 고민, 예산, 시술 경험 등을 모두 고려해서 안전하고 현실적인 시술 조합만 추천해드릴게요.",
    waitMessage: "앱을 종료하지 말고 잠시만 기다려 주세요.",
  },
  en: {
    title: "Analyzing your treatment plan",
    subtitle: "We're finding the best treatment combination based on your answers.",
    aiStatus: "AI analysis in progress",
    bottomInfo: "We consider your skin type, concerns, budget, and treatment history to recommend only safe and realistic options.",
    waitMessage: "Please keep this screen open while we prepare your results.",
  },
  ja: {
    title: "施術プランを分析中",
    subtitle: "ご回答いただいた内容に基づいて、最適な施術の組み合わせを見つけています。",
    aiStatus: "AI分析進行中",
    bottomInfo: "お肌のタイプ、お悩み、ご予算、施術経験などをすべて考慮して、安全で現実的な施術の組み合わせのみをご提案いたします。",
    waitMessage: "結果を準備していますので、この画面を開いたままお待ちください。",
  },
  "zh-CN": {
    title: "正在分析您的治疗方案",
    subtitle: "我们正在根据您的回答为您寻找最佳的治疗组合。",
    aiStatus: "AI分析进行中",
    bottomInfo: "我们会综合考虑您的皮肤类型、问题、预算和治疗经验，只为您推荐安全且切合实际的选项。",
    waitMessage: "我们正在准备您的结果，请保持此页面打开。",
  },
  "zh-TW": {
    title: "正在分析您的治療方案",
    subtitle: "我們正在根據您的回答為您尋找最佳的治療組合。",
    aiStatus: "AI分析進行中",
    bottomInfo: "我們會綜合考慮您的皮膚類型、問題、預算和治療經驗，只為您推薦安全且切合實際的選項。",
    waitMessage: "我們正在準備您的結果，請保持此頁面打開。",
  },
} as const;

export const MobileAnalysisLoadingScreen: React.FC<MobileAnalysisLoadingScreenProps> = ({
  locale: localeProp,
  delayBetweenStepsMs = 1000,
  onComplete,
}) => {
  // Use next-intl's useLocale hook to get the current locale
  const currentLocale = useLocale() as SupportedLocale;
  // Use prop if provided, otherwise use current locale from next-intl
  const locale = localeProp || currentLocale;

  const steps = ANALYSIS_STEPS[locale];
  const translations = TRANSLATIONS[locale];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= steps.length - 1) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setIndex((prev) => {
        if (prev >= steps.length - 1) return prev;
        return prev + 1;
      });
    }, delayBetweenStepsMs);

    return () => clearTimeout(timer);
  }, [index, steps.length, delayBetweenStepsMs, onComplete]);

  return (
    <div
      className="
        fixed inset-0 z-40
        overflow-hidden
        bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900
        text-white
      "
    >
      {/* 살짝 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 뒤에서 흐르는 코드 스트림 */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        {Array.from({ length: 3 }).map((_, colIndex) => (
          <motion.div
            key={colIndex}
            className="absolute w-1/3 px-3"
            style={{
              left: `${colIndex * 33.3333}%`,
            }}
            initial={{ y: "100%" }}
            animate={{ y: "-120%" }}
            transition={{
              duration: 10 + colIndex * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {fakeCodeLines.map((line, i) => (
              <div
                key={`${colIndex}-${i}`}
                className="text-[10px] leading-tight font-mono text-emerald-300/80 mb-2"
              >
                {line}
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col min-h-dvh items-center justify-center px-6 pb-[max(24px,env(safe-area-inset-bottom))]">
        {/* 상단 작은 로고/타이틀 영역 */}
        <div className="mb-10 flex flex-col items-center gap-1">
          <h1 className="mt-3 text-lg font-semibold tracking-tight">
            {translations.title}
          </h1>
          <p className="mt-1 text-xs text-slate-300 text-center">
            {translations.subtitle}
          </p>
            <div className="items-center">
            <DotLottieReact
                src="/lottie/analysis.lottie"
                loop
                autoplay
                style={{ width: 200, height: 200 }}
            />
            </div> 
        </div>
        
        {/* 중앙 카드 */}
        <div className="w-full max-w-sm rounded-3xl bg-slate-950/70 border border-white/10 shadow-2xl shadow-black/40 px-5 py-6 backdrop-blur-xl">
          {/* 로딩 인디케이터 */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-emerald-400/10 border border-emerald-400/40">
              <div className="w-5 h-5 rounded-full border border-emerald-400/60 border-t-transparent animate-spin" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-emerald-300">
                {translations.aiStatus}
              </span>
            </div>
          </div>

          {/* 한 줄씩 올라가는 분석 단계 문구 */}
          <div className="relative h-6 overflow-hidden mb-2">
            <TreatmentAnalysisLoading />
            {/* <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="text-sm font-medium text-slate-50"
              >
                {steps[index]}
              </motion.p>
            </AnimatePresence> */}
          </div>

          {/* 프로그레스 바 느낌 (진짜 로딩하고 상관없이 연출용) */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400"
              initial={{ width: "10%" }}
              animate={{ width: "100%" }}
              transition={{ duration: (steps.length * delayBetweenStepsMs) / 1000, ease: "easeInOut" }}
            />
          </div>

          {/* 하단 안내 문구 */}
          <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
            {translations.bottomInfo}
          </p>
        </div>

        {/* 맨 아래 작은 텍스트 */}
        <div className="mt-6 text-[10px] text-slate-500 text-center">
          {translations.waitMessage}
        </div>
      </div>
    </div>
  );
};
