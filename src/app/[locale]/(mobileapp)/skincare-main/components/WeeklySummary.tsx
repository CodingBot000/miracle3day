'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { mobileStorage, STORAGE_KEYS } from '@/lib/storage';
import { getWeekdayAbbr } from '@/i18n/weekdays';
import { useNavigation } from '@/hooks/useNavigation';
import DayCircle from './DayCircle';

interface WeeklySummaryProps {
  totalStepsPerDay: number;
  onViewDetails?: () => void;
  /** 오늘 완료한 스텝 수 (실시간 반영용, 미전달시 storage에서 읽음) */
  todayCompletedCount?: number;
}

interface DayStatus {
  date: string;
  dayLabel: string;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export default function WeeklySummary({
  totalStepsPerDay,
  onViewDetails,
  todayCompletedCount
}: WeeklySummaryProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { navigate } = useNavigation();

  const [weekData, setWeekData] = useState<DayStatus[]>([]);
  const [streak, setStreak] = useState(0);
  const [completedDays, setCompletedDays] = useState(0);

  useEffect(() => {
    // 다국어 요일 가져오기
    const weekdayLabels = getWeekdayAbbr(locale);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const todayDayOfWeek = now.getDay(); // 0 = 일요일

    // 이번 주 시작 (일요일)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - todayDayOfWeek);

    const weekDays: DayStatus[] = [];
    let completed = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === today;
      const isFuture = date > now;

      // 오늘인 경우: prop으로 전달받은 값 우선 사용, 없으면 storage에서 읽음
      let stepsCompleted: number;
      if (isToday && todayCompletedCount !== undefined) {
        stepsCompleted = todayCompletedCount;
      } else {
        const storageKey = STORAGE_KEYS.getRoutineProgressKey(dateStr);
        const saved = mobileStorage.getRaw(storageKey);
        stepsCompleted = saved ? JSON.parse(saved).length : 0;
      }

      // 하루 완료 기준: 전체 스텝 100% 완료
      const isDayCompleted = stepsCompleted >= totalStepsPerDay;

      if (isDayCompleted && !isFuture) {
        completed++;
      }

      weekDays.push({
        date: dateStr,
        dayLabel: weekdayLabels[i], // 다국어 라벨 사용
        completed: isDayCompleted && !isFuture,
        isToday,
        isFuture,
      });
    }

    setWeekData(weekDays);
    setCompletedDays(completed);
    setStreak(calculateStreak(todayCompletedCount));
  }, [totalStepsPerDay, locale, todayCompletedCount]);

  // 연속 달성 계산 (오늘 포함)
  const calculateStreak = (todayCount?: number): number => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let currentStreak = 0;

    // 오늘부터 거슬러 올라가며 확인
    for (let i = 0; i <= 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // 오늘인 경우: prop 값 우선 사용
      let stepsCompleted: number;
      if (dateStr === today && todayCount !== undefined) {
        stepsCompleted = todayCount;
      } else {
        const storageKey = STORAGE_KEYS.getRoutineProgressKey(dateStr);
        const saved = mobileStorage.getRaw(storageKey);
        stepsCompleted = saved ? JSON.parse(saved).length : 0;
      }

      if (stepsCompleted > 0) {
        currentStreak++;
      } else if (i > 0) {
        // 오늘은 아직 안했어도 괜찮음, 어제부터 체크
        break;
      }
    }

    return currentStreak;
  };

  // 격려 메시지 생성
  const getMotivationMessage = () => {
    const todayCompleted = weekData.find(d => d.isToday)?.completed;

    if (todayCompleted && streak > 0) {
      if (streak >= 7) {
        return "일주일 연속 달성! 대단해요!";
      }
      return `${streak}일 연속 달성!`;
    }

    if (streak > 0 && !todayCompleted) {
      return `오늘만 하면 ${streak + 1}일 연속!`;
    }

    if (completedDays === 0) {
      return "오늘부터 시작해볼까요?";
    }

    return `${streak}일 연속이 끊길 수 있어요!`;
  };

  return (
    <div className="bg-blue-200 rounded-xl p-4 shadow-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-black font-semibold text-sm">This Week Progress</h3>
        <span className="text-black/80 text-xs font-medium px-2.5 py-1 bg-white/10 rounded-full">
          {completedDays}/7 days
        </span>
      </div>

      {/* 요일별 원형 Progress */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekData.map((day) => (
          <DayCircle
            key={day.date}
            day={day.dayLabel}
            isCompleted={day.completed}
            isToday={day.isToday}
            isFuture={day.isFuture}
          />
        ))}
      </div>

      {/* 격려 메시지 + 상세보기 */}
      <div className="flex items-center justify-between">
        <p className={`
          text-sm font-semibold flex items-center gap-1.5
          ${streak > 0 && weekData.find(d => d.isToday)?.completed
            ? 'text-green-700'
            : streak > 0
            ? 'text-amber-700'
            : 'text-gray-600'
          }
        `}>
          {streak > 0 && weekData.find(d => d.isToday)?.completed && streak >= 7 && (
            <span>🏆</span>
          )}
          {streak > 0 && <span>🔥</span>}
          {getMotivationMessage()}
          {streak > 0 && !weekData.find(d => d.isToday)?.completed && (
            <span>💪</span>
          )}
        </p>
        <button
          onClick={() => onViewDetails ? onViewDetails() : navigate('/skincare-main/progress')}
          className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
        >
          상세보기 &gt;
        </button>
      </div>
    </div>
  );
}
