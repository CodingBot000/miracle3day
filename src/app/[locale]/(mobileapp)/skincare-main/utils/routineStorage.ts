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
    if (typeof window === 'undefined') return [];
    const key = this.getTodayKey();
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  }

  // 오늘 진행도 저장
  static saveTodayProgress(checkedSteps: string[]): void {
    if (typeof window === 'undefined') return;
    const key = this.getTodayKey();
    localStorage.setItem(key, JSON.stringify(checkedSteps));
  }

  // 특정 날짜 진행도 가져오기
  static getProgressByDate(date: Date): string[] {
    if (typeof window === 'undefined') return [];
    const key = this.getDateKey(date);
    const saved = localStorage.getItem(key);
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
    if (typeof window === 'undefined') return 0;

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
    if (typeof window === 'undefined') return;

    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    // localStorage의 모든 키를 확인
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('routine_progress_')) {
        const dateStr = key.replace('routine_progress_', '');
        const date = new Date(dateStr);
        if (date < cutoffDate) {
          localStorage.removeItem(key);
        }
      }
    }
  }
}
