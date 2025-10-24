import { redirect } from 'next/navigation';
import { getAuthSession } from "@/lib/auth-helper";
import WriteForm from '@/components/molecules/WriteForm';
import type { CommunityCategory } from '@/app/models/communityData.dto';
import {
  TABLE_COMMUNITY_CATEGORIES,
} from '@/constants/tables';
import { q } from '@/lib/db';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

async function getCategories(): Promise<CommunityCategory[]> {
  const rows = await q(
    `SELECT id, name, description, order_index, is_active
     FROM ${TABLE_COMMUNITY_CATEGORIES}
     WHERE is_active = true
     ORDER BY order_index ASC`
  );
  return rows as CommunityCategory[];
}

export default async function WritePage() {
  const authSession = await getAuthSession(req); if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const { userId } = authSession;

  if (!userId) {
    redirect('/auth/login');
  }

  const member = await findMemberByUserId(userId);

  if (!member) {
    redirect('/auth/login');
  }

  const categories = await getCategories();
  const authorNameSnapshot =
    (member['nickname'] as string | undefined)?.trim() ??
    (member['name'] as string | undefined)?.trim() ??
    null;
  const authorAvatarSnapshot =
    (member['avatar'] as string | undefined)?.trim() ?? null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Write New Post</h1>
        <WriteForm
          authorNameSnapshot={authorNameSnapshot}
          authorAvatarSnapshot={authorAvatarSnapshot}
          categories={categories}
        />
      </div>
    </div>
  )
}
