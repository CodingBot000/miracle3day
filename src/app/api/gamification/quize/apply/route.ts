export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createBadgeStore } from '@/lib/gamification/adapters/badgeStore';
import { applyQuizAttempt } from '@/lib/gamification/handlers/applyQuizAttempt';
import { createClient } from '@/utils/session/server';

export async function POST(req: Request) {
  try {
    // 로그인한 사용자 확인
    const backendClient = createClient();
    const { data: { user }, error: authError } = await backendClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const body = await req.json();
    const { questionId, optionIndex } = body;

    const store = createBadgeStore();

    // Get question to verify answer
    const q = await store.getNextQuestion(userId);
    const isCorrect = q?.id === questionId && q?.answerIndex === optionIndex;

    const result = await applyQuizAttempt(store, { userId, isCorrect });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}
