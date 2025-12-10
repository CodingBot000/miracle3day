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
    ja: [
    "パーソナライズされた施術計画を分析中です...",
    "肌タイプとお悩みを確認中です...",
    "適切な施術オプションを選択中です...",
    "現在のお肌の状態を適用中です...",
    "優先順位に基づいて施術を絞り込み中です...",
    "選択された予算範囲内で再絞り込み中です...",
    "最終結果のレポートを生成中です...",
  ],
  "zh-CN": [
    "正在分析您的个性化治疗方案...",
    "正在查看您的皮肤类型和问题...",
    "正在选择合适的治疗选项...",
    "正在应用您当前的皮肤状况...",
    "正在根据您的优先级筛选治疗方案...",
    "正在您选定的预算范围内重新筛选...",
    "正在生成最终结果报告...",
  ],
  "zh-TW": [
    "正在分析您的個人化治療方案...",
    "正在查看您的皮膚類型和問題...",
    "正在選擇合適的治療選項...",
    "正在應用您當前的皮膚狀況...",
    "正在根據您的優先順序篩選治療方案...",
    "正在您選定的預算範圍內重新篩選...",
    "正在生成最終結果報告...",
  ],
} as const;

export type SupportedLocale = keyof typeof ANALYSIS_STEPS;