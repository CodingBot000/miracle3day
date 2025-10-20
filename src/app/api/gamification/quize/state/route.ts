export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createBadgeStore } from '@/lib/gamification/adapters/badgeStore';
import { createClient } from '@/utils/session/server';

export async function GET(req: Request) {
  try {
    console.log('[QuizState] Starting GET request');

    // 로그인한 사용자 확인
    const backendClient = createClient();
    const { data: { user }, error: authError } = await backendClient.auth.getUser();

    if (authError || !user) {
      console.error('[QuizState] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    console.log('[QuizState] User ID:', userId);

    const store = createBadgeStore();
    console.log('[QuizState] Store created');

    const { quiz_rules } = await store.getConfig();
    console.log('[QuizState] Config loaded:', quiz_rules);

    const now = new Date();
    const ymd = new Intl.DateTimeFormat('sv-SE', { timeZone: quiz_rules.reset_tz || 'Asia/Seoul' })
      .format(now).slice(0, 10).replaceAll('-', '');
    console.log('[QuizState] Date (YYYYMMDD):', ymd);

    console.log('[QuizState] Fetching parallel data...');
    const [todayCount, streakDays, badges, master, nextQuestion] = await Promise.all([
      store.getTodaySolvedCount(userId, ymd),
      store.getStreakDays(userId, ymd),
      store.getUserBadges(userId),
      store.getBadgesMaster(),
      store.getNextQuestion(userId)
    ]);

    console.log('[QuizState] Data fetched:', { todayCount, streakDays, badgesCount: badges.length, masterCount: master.length });

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
