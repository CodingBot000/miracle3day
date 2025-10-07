export type QuizRules = {
  daily_full_reward_quota: number;   // 예: 5
  overflow_multiplier: number;       // 예: 0.2
  base_attempt_exp: number;          // 예: 5
  correct_bonus_exp: number;         // 예: 1
  streak_bonus_per_day: number;      // 예: 0.05
  streak_bonus_cap: number;          // 예: 0.25
  reset_tz: string;                  // 'Asia/Seoul'
};

export function calcAttemptExp(params: {
  todaySolvedCount: number; // 오늘 시도 전 개수
  isCorrect: boolean;
  streakDays: number;       // 오늘 시도 전 스트릭
  rules: QuizRules;
}) {
  const { todaySolvedCount, isCorrect, streakDays, rules } = params;
  const isFull = todaySolvedCount < rules.daily_full_reward_quota;
  const mult = isFull ? 1 : rules.overflow_multiplier;
  const streakMult = 1 + Math.min(streakDays * rules.streak_bonus_per_day, rules.streak_bonus_cap);
  const base = rules.base_attempt_exp + (isCorrect ? rules.correct_bonus_exp : 0);
  return Math.round(base * mult * streakMult);
}
