import { calcAttemptExp } from '@/lib/gamification/domain/rules';
import type { BadgeStore } from '@/lib/gamification/ports/badgeStore';

export async function applyQuizAttempt(store: BadgeStore, input: {
  userId: string;
  isCorrect: boolean;
  now?: Date;
  idempotencyKey?: string;
}) {
  const now = input.now ?? new Date();
  const { quiz_rules } = await store.getConfig();

  // YYYYMMDD (KST 등 설정된 TZ 기준)
  const ymd = new Intl.DateTimeFormat('sv-SE', { timeZone: quiz_rules.reset_tz || 'Asia/Seoul' })
    .format(now).slice(0, 10).replaceAll('-', '');

  const todayCount = await store.getTodaySolvedCount(input.userId, ymd);
  const streakDays = await store.getStreakDays(input.userId, ymd);

  const exp = calcAttemptExp({
    todaySolvedCount: todayCount,
    isCorrect: input.isCorrect,
    streakDays,
    rules: quiz_rules,
  });

  const idem = input.idempotencyKey ?? `${input.userId}:${ymd}:${todayCount + 1}:${+now}`;

  await store.appendActivity({
    userId: input.userId,
    yyyymmdd: ymd,
    isCorrect: input.isCorrect,
    exp,
    idempotencyKey: idem
  });

  const { newExp, newLevel } = await store.addExp(input.userId, exp);

  if (input.isCorrect) {
    await store.ensureUserBadgeState(input.userId, 'quiz_master');
    await store.bumpQuizMasterProgress(input.userId, 1);
  }

  const nextQuestion = await store.getNextQuestion(input.userId);

  return {
    expEarned: exp,
    totalToday: todayCount + 1,
    newExp,
    newLevel,
    nextQuestion,
  };
}
