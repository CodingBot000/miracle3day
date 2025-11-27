export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createBadgeStore } from '@/lib/gamification/adapters/badgeStore';
import { getAuthSession } from "@/lib/auth-helper";

export async function GET(req: Request) {
  try {
    log.debug('[QuizState] Starting GET request');

    const authSession = await getAuthSession(req); if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const { userId } = authSession;

    if (!userId) {
      console.error('[QuizState] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    log.debug('[QuizState] User ID:', userId);

    const store = createBadgeStore();
    log.debug('[QuizState] Store created');

    const { quiz_rules } = await store.getConfig();
    log.debug('[QuizState] Config loaded:', quiz_rules);

    const now = new Date();
    const ymd = new Intl.DateTimeFormat('sv-SE', { timeZone: quiz_rules.reset_tz || 'Asia/Seoul' })
      .format(now).slice(0, 10).replaceAll('-', '');
    log.debug('[QuizState] Date (YYYYMMDD):', ymd);

    log.debug('[QuizState] Fetching parallel data...');
    const [todayCount, streakDays, badges, master, nextQuestion] = await Promise.all([
      store.getTodaySolvedCount(userId, ymd),
      store.getStreakDays(userId, ymd),
      store.getUserBadges(userId),
      store.getBadgesMaster(),
      store.getNextQuestion(userId)
    ]);

    log.debug('[QuizState] Data fetched:', { todayCount, streakDays, badgesCount: badges.length, masterCount: master.length });

    return NextResponse.json({
      today: { count: todayCount, quota: quiz_rules.daily_full_reward_quota },
      streakDays,
      badges,
      badgesMaster: master,
      question: nextQuestion,
    }, { status: 200 });
  } catch (e: any) {
    console.error('[QuizState] Error:', e);
    console.error('[QuizState] Error stack:', e?.stack);
    return NextResponse.json({ error: e?.message ?? 'unknown', stack: e?.stack }, { status: 500 });
  }
}
