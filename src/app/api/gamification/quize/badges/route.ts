export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createBadgeStore } from '@/lib/gamification/adapters/badgeStore';
import { getAuthSession } from "@/lib/auth-helper";

export async function GET() {
  try {
    const authSession = await getAuthSession(req); if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const { userId } = authSession;

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
