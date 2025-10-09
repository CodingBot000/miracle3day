import type { QuizRules } from '../domain/rules';

export interface BadgeStore {
  getConfig(): Promise<{ quiz_rules: QuizRules }>;
  getTodaySolvedCount(userId: string, yyyymmdd: string): Promise<number>;
  getStreakDays(userId: string, yyyymmdd: string): Promise<number>;
  appendActivity(args: {
    userId: string;
    yyyymmdd: string;
    isCorrect: boolean;
    exp: number;
    idempotencyKey: string;
  }): Promise<void>;
  addExp(userId: string, exp: number): Promise<{ newExp: number; newLevel: number }>;
  bumpQuizMasterProgress(userId: string, deltaCorrect: number): Promise<void>;
  ensureUserBadgeState(userId: string, badgeCode: string): Promise<void>;
  getUserBadges(userId: string): Promise<Array<{ code: string; level: number }>>;
  getBadgesMaster(): Promise<Array<{ code: string; name: any; category: string; max_level: number }>>;
  getNextQuestion(userId: string): Promise<{ id: string; stem: string; options: string[]; answerIndex: number }>;
}
