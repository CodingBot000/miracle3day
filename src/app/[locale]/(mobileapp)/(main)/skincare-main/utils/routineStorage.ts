import { mobileStorage } from '@/lib/storage';

interface DailyProgress {
  date: string;  // YYYY-MM-DD
  checkedSteps: string[];  // ['morning-1', 'midday-6', ...]
  completedAt?: string;  // ISO timestamp
}

export class RoutineStorage {
  // 오늘 날짜 키
  private static getTodayKey(): string {
    const today = new Date().toISOString().split('T')[0];
    return `routine_progress_${today}`;
  }

  // 특정 날짜 키
  private static getDateKey(date: Date): string {
    const dateStr = date.toISOString().split('T')[0];
    return `routine_progress_${dateStr}`;
  }

  // 오늘 진행도 가져오기
  static getTodayProgress(): string[] {
    const key = this.getTodayKey();
    const saved = mobileStorage.getRaw(key);
    return saved ? JSON.parse(saved) : [];
  }

  // 오늘 진행도 저장
  static saveTodayProgress(checkedSteps: string[]): void {
    const key = this.getTodayKey();
    mobileStorage.setRaw(key, JSON.stringify(checkedSteps));
  }

  // 특정 날짜 진행도 가져오기
  static getProgressByDate(date: Date): string[] {
    const key = this.getDateKey(date);
    const saved = mobileStorage.getRaw(key);
    return saved ? JSON.parse(saved) : [];
  }

  // 최근 7일 진행도
  static getWeekProgress(): DailyProgress[] {
    const result: DailyProgress[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const checkedSteps = this.getProgressByDate(date);

      result.push({
        date: dateStr,
        checkedSteps,
      });
    }

    return result;
  }

  // 연속 달성 일수
  static getStreak(): number {
    const now = new Date();
    let streak = 0;

    for (let i = 1; i <= 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const progress = this.getProgressByDate(date);

      if (progress.length > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // 진행도 퍼센트 계산
  static calculatePercentage(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  // 오래된 데이터 정리 (30일 이전)
  static cleanupOldData(): void {
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    // mobileStorage의 모든 키를 확인
    const keys = mobileStorage.keys();
    for (const key of keys) {
      if (key.startsWith('routine_progress_')) {
        const dateStr = key.replace('routine_progress_', '');
        const date = new Date(dateStr);
        if (date < cutoffDate) {
          mobileStorage.remove(key);
        }
      }
    }
  }
}
