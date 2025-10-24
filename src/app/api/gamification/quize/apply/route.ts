export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createBadgeStore } from '@/lib/gamification/adapters/badgeStore';
import { applyQuizAttempt } from '@/lib/gamification/handlers/applyQuizAttempt';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
