// 루틴 화면 기간
export type RoutinePeriod = 'daily' | 'weekly' | 'monthly';

// 루틴 Step 그룹 (AM / PM / 스페셜)
export type RoutineStepGroup = 'AM' | 'PM' | 'SPECIAL';

export interface RoutineStepDefinition {
  id: string;
  group: RoutineStepGroup;
  title: string;
  description?: string;
  // 주기: 매일, 격일, 주1회 등 (나중에 enum 확대 가능)
  frequency: 'daily' | 'alternate' | 'weekly';
  // 통계 포함 여부
  includeInStats: boolean;
}

export interface DailyStepState {
  stepId: string;
  completed: boolean;
  // 추후 "오늘만 스킵" 같은 상태 추가 가능
}

export interface DailyRoutineState {
  date: string; // ISO 날짜 (YYYY-MM-DD)
  steps: DailyStepState[];
  // 오늘의 질문/메모
  skinTightnessScore?: number; // 0-10
  note?: string;
}

export interface WeeklyRoutineStats {
  weekStartDate: string; // 주 시작 날짜 (YYYY-MM-DD)
  // 요일별 완료율 (0~1)
  dailyCompletionRates: Record<string, number>; // key: YYYY-MM-DD
  amCompletionRate: number;
  pmCompletionRate: number;
  specialCompletionRate: number;
}

export interface MonthlyRoutineStats {
  month: string; // YYYY-MM
  // 날짜별 완료율 (0~1)
  dailyCompletionRates: Record<string, number>; // key: YYYY-MM-DD
  // 요약 정보
  averageCompletionRate: number;
  previousMonthCompletionRate?: number;
  bestDayOfWeek?: string; // 'Mon' | 'Tue' ...
  mostMissedStepId?: string;
}

// 챌린지/랭킹 요약 - 간단 버전
export interface ChallengeSummary {
  teamName: string;
  countryCode: string; // 'KR', 'US'...
  teamCompletionRate: number; // 0~1
  myRank: number;
  totalMembers: number;
}
