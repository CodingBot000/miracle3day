export const ANALYSIS_STEPS = {
  ko: [
    "맞춤형 시술 계획 분석중입니다...",
    "피부타입과 고민을 확인 중입니다..",
    "적합한 시술 리스트를 선별 중입니다..",
    "현재 사용자의 상태를 적용 중입니다..",
    "선택한 우선순위에 따라 시술리스트를 선별합니다..",
    "선택한 예산범위에서 시술리스트를 재선별합니다..",
    "최종 결과를 위해 리포트를 작성 중입니다..",
  ],
  en: [
    "Analyzing your personalized treatment plan...",
    "Reviewing your skin type and concerns...",
    "Selecting suitable treatment options...",
    "Applying your current skin status...",
    "Filtering treatments based on your priorities...",
    "Re-filtering within your selected budget range...",
    "Generating the final report for your results...",
  ],
} as const;

export type SupportedLocale = keyof typeof ANALYSIS_STEPS;