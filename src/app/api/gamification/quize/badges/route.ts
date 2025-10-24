export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createBadgeStore } from '@/lib/gamification/adapters/badgeStore';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = createBadgeStore();

    const [master, mine] = await Promise.all([
      store.getBadgesMaster(),
      store.getUserBadges(userId)
    ]);

    return NextResponse.json({ master, mine }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}
