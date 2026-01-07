'use client';

import { useEffect, useState } from 'react';
import { mobileStorage, STORAGE_KEYS } from '@/lib/storage';

interface RoutineStep {
  id_uuid: string;
  step_order: number;
  step_type: string;
  step_name: string;
}

interface RoutineData {
  id_uuid_member: string;
  morning_steps: RoutineStep[];
  midday_steps: RoutineStep[];
  evening_steps: RoutineStep[];
}

interface ProgressTabProps {
  routine: RoutineData;
}

interface DailyProgress {
  date: string;
  label: string;
  completed: number;
  total: number;
  percentage: number;
  isToday?: boolean;
  isPast?: boolean;
}

// 요일 인덱스 (Sun=0, Mon=1, ..., Sat=6)
const DAY_ORDER: Record<string, number> = {
  'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
};

export default function ProgressTab({ routine }: ProgressTabProps) {
  const [todayStats, setTodayStats] = useState({ completed: 0, total: 0, percentage: 0 });
  const [weekStats, setWeekStats] = useState({
    daily: [] as DailyProgress[],
    average: 0,
    totalCompleted: 0,
    totalSteps: 0
  });
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'api' | 'local'>('local');

  const totalStepsPerDay =
    routine.morning_steps.length +
    routine.midday_steps.length +
    routine.evening_steps.length;

  useEffect(() => {
    const loadStats = async () => {
      console.log('[DEBUG] 📊 Loading weekly stats...');

      // 오늘 통계는 항상 localStorage에서 (가장 최신, 실시간 반영)
      const todayProgress = getTodayProgress(totalStepsPerDay);
      setTodayStats(todayProgress);

      const todayStr = new Date().toISOString().split('T')[0];

      try {
        // API에서 주간 통계 로드 시도
        const response = await fetch(
          `/api/skincare/progress/weekly?id_uuid_member=${routine.id_uuid_member}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          console.log('[DEBUG] ✅ Weekly stats from API:', result.data);

          // API 데이터로 주간 통계 설정 + 오늘/과거 플래그 추가
          // 오늘 데이터는 localStorage 값으로 덮어씌움 (실시간 반영)
          const apiDaily: DailyProgress[] = result.data.daily.map((d: { date: string; label: string; completed: number; total: number; rate: number }) => {
            const isToday = d.date === todayStr;
            const isPast = d.date < todayStr;

            // 오늘 데이터는 localStorage 값 사용 (가장 최신)
            if (isToday) {
              return {
                date: d.date,
                label: d.label,
                completed: todayProgress.completed,
                total: todayProgress.total,
                percentage: todayProgress.percentage,
                isToday: true,
                isPast: false
              };
            }

            return {
              date: d.date,
              label: d.label,
              completed: d.completed,
              total: d.total,
              percentage: d.rate,
              isToday: false,
              isPast
            };
          });

          // Sun, Mon, Tue, Wed, Thu, Fri, Sat 순서로 정렬
          apiDaily.sort((a, b) => DAY_ORDER[a.label] - DAY_ORDER[b.label]);

          // 오늘 데이터를 반영한 평균 재계산
          const totalCompleted = apiDaily.reduce((sum, d) => sum + d.completed, 0);
          const totalPossible = totalStepsPerDay * 7;
          const recalculatedAverage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

          setWeekStats({
            daily: apiDaily,
            average: recalculatedAverage,
            totalCompleted,
            totalSteps: totalPossible
          });

          setStreak(result.data.streak);
          setDataSource('api');
        } else {
          throw new Error(result.error || 'API failed');
        }
      } catch (error) {
        console.log('[DEBUG] ⚠️ API failed, using localStorage fallback:', error);

        // Fallback: localStorage 기반 계산
        setWeekStats(getWeekProgress(totalStepsPerDay));
        setStreak(getStreak());
        setDataSource('local');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [totalStepsPerDay, routine.id_uuid_member]);

  return (
    <div className="p-4 space-y-6">
      {/* 오늘 + 연속 달성 (가로 배치) */}
      <div className="flex gap-3">
        {/* Today 카드 */}
        <div className="flex-1">
          <StatCard
            title="Today"
            completed={todayStats.completed}
            total={todayStats.total}
            percentage={todayStats.percentage}
          />
        </div>

        {/* Current Streak 카드 (80px 고정) */}
        <div
          className="w-20 flex-shrink-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-2 text-white shadow-lg flex flex-col items-center justify-center"
        >
          <p className="text-[12px] opacity-90 whitespace-nowrap">Streak</p>
          <p className="text-xl font-bold leading-tight">{streak}</p>
          <p className="text-[10px] opacity-90">🔥</p>
          {streak >= 7 && <span className="text-sm">🏆</span>}
        </div>
      </div>

      {/* 이번 주 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">This Week</h3>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Average</span>
            <span className="font-bold">{weekStats.average}%</span>
          </div>
          <p className="text-xs text-gray-500">
            {weekStats.totalCompleted} of {weekStats.totalSteps} steps
          </p>
        </div>

        {/* 요일별 진행도 */}
        <div className="space-y-2">
          {isLoading ? (
            // 스켈레톤 로딩
            [...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center animate-pulse">
                <div className="w-10 h-4 bg-gray-200 rounded" />
                <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2" />
                <div className="w-10 h-4 bg-gray-200 rounded" />
              </div>
            ))
          ) : (
            weekStats.daily.map((day) => {
              // 그래프 색상 결정
              const getBarColor = () => {
                if (day.isToday) return 'bg-blue-600'; // 오늘: 항상 파란색
                if (day.isPast) {
                  if (day.percentage >= 100) return 'bg-green-500'; // 100%: 녹색
                  if (day.percentage > 50) return 'bg-blue-600';    // 50% 초과: 파란색
                  return 'bg-red-500';                              // 50% 이하: 빨간색
                }
                return 'bg-gray-300'; // 미래: 회색
              };

              return (
                <div key={day.date} className="flex items-center">
                  {/* 오늘 요일은 진한 볼드 파란색 */}
                  <span className={`text-xs w-10 ${
                    day.isToday
                      ? 'font-bold text-blue-700'
                      : 'text-gray-600'
                  }`}>
                    {day.label}
                  </span>
                  <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getBarColor()} h-2 rounded-full transition-all`}
                      style={{ width: `${day.percentage}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold w-10 text-right ${
                    day.isToday ? 'text-blue-700' : ''
                  }`}>
                    {day.percentage}%
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Phase 2 예정 안내 */}
      <div className="bg-gray-100 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-600">
          📸 Selfie tracking &amp; detailed analytics<br />
          coming soon!
        </p>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({
  title,
  completed,
  total,
  percentage
}: {
  title: string;
  completed: number;
  total: number;
  percentage: number;
}) {
  return (
    <div className="bg-white rounded-xl px-6 py-2 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-bold">{title}</h3>
        <span className="text-2xl font-bold text-blue-600">{percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-sm text-gray-600">
        {completed} / {total} steps completed
      </p>
    </div>
  );
}

// 유틸 함수들
function getTodayProgress(totalSteps: number) {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = STORAGE_KEYS.getRoutineProgressKey(today);

  const saved = mobileStorage.getRaw(storageKey);
  const completed = saved ? JSON.parse(saved).length : 0;
  const percentage = totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0;

  return { completed, total: totalSteps, percentage };
}

function getWeekProgress(totalStepsPerDay: number) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const daily: DailyProgress[] = [];
  let totalCompleted = 0;

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const storageKey = STORAGE_KEYS.getRoutineProgressKey(dateStr);

    const saved = mobileStorage.getRaw(storageKey);
    const completed = saved ? JSON.parse(saved).length : 0;

    totalCompleted += completed;

    daily.push({
      date: dateStr,
      label: days[date.getDay()],
      completed,
      total: totalStepsPerDay,
      percentage: totalStepsPerDay > 0 ? Math.round((completed / totalStepsPerDay) * 100) : 0,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr
    });
  }

  // Sun, Mon, Tue, Wed, Thu, Fri, Sat 순서로 정렬
  daily.sort((a, b) => DAY_ORDER[a.label] - DAY_ORDER[b.label]);

  const totalSteps = totalStepsPerDay * 7;
  const average = totalSteps > 0 ? Math.round((totalCompleted / totalSteps) * 100) : 0;

  return {
    daily,
    average,
    totalCompleted,
    totalSteps
  };
}

function getStreak(): number {
  const now = new Date();
  let streak = 0;

  // 어제부터 거슬러 올라가며 연속 달성 확인
  for (let i = 1; i <= 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const storageKey = STORAGE_KEYS.getRoutineProgressKey(dateStr);
    const saved = mobileStorage.getRaw(storageKey);

    if (saved && JSON.parse(saved).length > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
