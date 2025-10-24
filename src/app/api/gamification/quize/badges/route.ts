export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createBadgeStore } from '@/lib/gamification/adapters/badgeStore';
import { getAuthSession } from "@/lib/auth-helper";
import { requireUserId } from '@/lib/auth/require-user';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

export async function GET() {
  try {
    
    const userId = await requireUserId();                 // ✅ 세션에서 보안적으로 추출
    // const member = await findMemberByUserId(userId);      // (원하면 생략 가능)
  
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
