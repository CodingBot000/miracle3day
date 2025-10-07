export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseStore } from '@/lib/gamification/adapters/supabaseStore';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    // 로그인한 사용자 확인
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const store = supabaseStore();

    const [master, mine] = await Promise.all([
      store.getBadgesMaster(),
      store.getUserBadges(userId)
    ]);

    return NextResponse.json({ master, mine }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}
