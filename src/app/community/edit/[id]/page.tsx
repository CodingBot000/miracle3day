import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
import WriteForm from '@/components/molecules/WriteForm';
import type { CommunityCategory } from '@/app/models/communityData.dto';
import {
  TABLE_COMMUNITY_POSTS,
  TABLE_COMMUNITY_CATEGORIES,
} from '@/constants/tables';
import { q } from '@/lib/db';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';
import { requireUserId } from '@/lib/auth/require-user';

async function getCategories(): Promise<CommunityCategory[]> {
  const rows = await q(
    `SELECT id, name, description, order_index, is_active
     FROM ${TABLE_COMMUNITY_CATEGORIES}
     WHERE is_active = true
     ORDER BY order_index ASC`
  );
  return rows as CommunityCategory[];
}

export default async function EditPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = await requireUserId();                 // ✅ 세션에서 보안적으로 추출
  const member = await findMemberByUserId(userId);      // (원하면 생략 가능)

  if (!member) {
    redirect("/auth/login");
  }

 

  const memberUuid =
    (member['uuid'] as string | undefined) ??
    (member['id_uuid'] as string | undefined) ??
    userId!;

  const posts = await q(
    `SELECT * FROM ${TABLE_COMMUNITY_POSTS}
     WHERE id = $1 AND is_deleted = false
     LIMIT 1`,
    [params.id]
  );

  const post = posts[0];

  if (!post) {
    redirect('/');
  }

  if (post.uuid_author !== memberUuid) {
    redirect(`/community/post/${params.id}`);
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
        <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
        <WriteForm
          authorNameSnapshot={authorNameSnapshot}
          authorAvatarSnapshot={authorAvatarSnapshot}
          categories={categories}
          initialData={{
            title: post.title,
            content: post.content,
            id_category: post.id_category ? String(post.id_category) : undefined,
          }}
          postId={post.id}
        />
      </div>
    </div>
  );
}
