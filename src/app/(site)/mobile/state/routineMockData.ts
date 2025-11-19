import { DailyRoutineState, RoutineStepGroup, WeeklyRoutineStats, MonthlyRoutineStats, ChallengeSummary } from './routineTypes';
import { formatISODate, getCurrentMonthKey } from '@/app/(site)/mobile/lib/dateHelpers';

// 간단한 Step 정의는 여기서 하드코딩 (나중에 서버/DB로 이동 가능)
const STEP_DEFINITIONS = [
  {
    id: 'am_cleanser',
    group: 'AM' as RoutineStepGroup,
    title: '저자극 클렌징',
    description: '아침에는 가볍게 유분과 노폐물만 제거해요.',
    frequency: 'daily' as const,
    includeInStats: true,
  },
  {
    id: 'am_toner',
    group: 'AM' as RoutineStepGroup,
    title: '토너 패드',
    description: '피부결을 정돈하고 다음 단계 흡수를 도와요.',
    frequency: 'daily' as const,
    includeInStats: true,
  },
  {
    id: 'am_sunscreen',
    group: 'AM' as RoutineStepGroup,
    title: '자외선 차단',
    description: 'UV 차단은 가장 중요한 노화 방지 루틴이에요.',
    frequency: 'daily' as const,
    includeInStats: true,
  },
  {
    id: 'pm_cleansing',
    group: 'PM' as RoutineStepGroup,
    title: '메이크업 딥 클렌징',
    description: '자극은 최소화하고 잔여물을 말끔히 제거해요.',
    frequency: 'daily' as const,
    includeInStats: true,
  },
  {
    id: 'pm_treatment',
    group: 'PM' as RoutineStepGroup,
    title: '기능성 앰플',
    description: '미백/탄력/진정 중 고민에 맞춘 앰플 사용.',
    frequency: 'daily' as const,
    includeInStats: true,
  },
  {
    id: 'special_mask',
    group: 'SPECIAL' as RoutineStepGroup,
    title: '수분 마스크',
    description: '주 2회 깊은 보습 케어.',
    frequency: 'weekly' as const,
    includeInStats: true,
  },
];

export function createInitialDailyRoutine(): DailyRoutineState {
  const today = formatISODate(new Date());
  return {
    date: today,
    steps: STEP_DEFINITIONS.map(def => ({
      stepId: def.id,
      completed: false,
    })),
  };
}

export function getStepDefinitions() {
  return STEP_DEFINITIONS;
}

// 아래 주간/월간/챌린지 mock은 대략적인 값으로 채워준다.
export function createMockWeeklyStats(): WeeklyRoutineStats {
  const today = new Date();
  // 단순 mock: 7일간 랜덤 비슷한 값
  const dailyCompletionRates: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dailyCompletionRates[formatISODate(d)] = 0.5 + Math.random() * 0.4; // 0.5~0.9
  }

  return {
    weekStartDate: formatISODate(today),
    dailyCompletionRates,
    amCompletionRate: 0.8,
    pmCompletionRate: 0.7,
    specialCompletionRate: 0.5,
  };
}

export function createMockMonthlyStats(): MonthlyRoutineStats {
  const monthKey = getCurrentMonthKey(); // 'YYYY-MM'
  const dailyCompletionRates: Record<string, number> = {};
  // 간단히 1~30일 생성
  for (let d = 1; d <= 30; d++) {
    const dayString = `${monthKey}-${String(d).padStart(2, '0')}`;
    dailyCompletionRates[dayString] = 0.3 + Math.random() * 0.6;
  }

  return {
    month: monthKey,
    dailyCompletionRates,
    averageCompletionRate: 0.7,
    previousMonthCompletionRate: 0.6,
    bestDayOfWeek: 'Wed',
    mostMissedStepId: 'am_sunscreen',
  };
}

export function createMockChallengeSummary(): ChallengeSummary {
  return {
    teamName: 'Korea Summer Glow',
    countryCode: 'KR',
    teamCompletionRate: 0.72,
    myRank: 12,
    totalMembers: 145,
  };
}
