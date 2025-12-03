import { redirect } from 'next/navigation';
import WriteForm from '@/components/molecules/WriteForm';
import type { CommunityCategory } from '@/app/models/communityData.dto';
import {
  TABLE_COMMUNITY_CATEGORIES,
} from '@/constants/tables';
import { q } from '@/lib/db';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';
import { requireUserId } from '@/lib/auth/require-user';

async function getCategories(): Promise<CommunityCategory[]> {
  const rows = await q(
    `SELECT id, name, description, is_active, category_type, icon, display_order
     FROM ${TABLE_COMMUNITY_CATEGORIES}
     WHERE is_active = true
     ORDER BY display_order ASC`
  );
  return rows as CommunityCategory[];
}

export default async function WritePage({
  searchParams,
}: {
  searchParams: { defaultTopic?: string; defaultTag?: string }
}) {
  const userId = await requireUserId();
  const member = await findMemberByUserId(userId);

  if (!member) {
    redirect("/login");
  }

  const categories = await getCategories();
  const authorNameSnapshot =
    (member['nickname'] as string | undefined)?.trim() ??
    (member['name'] as string | undefined)?.trim() ??
    null;
  const authorAvatarSnapshot =
    (member['avatar'] as string | undefined)?.trim() ?? null;

  // URL params에서 기본값 가져오기
  const defaultTopic = searchParams.defaultTopic || undefined;
  const defaultTag = searchParams.defaultTag || undefined;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Write New Post</h1>
        <WriteForm
          authorNameSnapshot={authorNameSnapshot}
          authorAvatarSnapshot={authorAvatarSnapshot}
          categories={categories}
          defaultTopic={defaultTopic}
          defaultTag={defaultTag}
        />
      </div>
    </div>
  )
}
