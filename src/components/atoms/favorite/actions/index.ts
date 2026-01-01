"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { q } from "@/lib/db";
import { TABLE_FAVORITE } from "@/constants/tables";
import { findMemberByUserId } from "@/app/api/auth/getUser/member.helper";
import { requireUserId } from "@/lib/auth/require-user";

interface FavoriteActions {
  isFavorite: boolean;
  id_hospital: string;
}

export const favoriteActions = async ({
  isFavorite,
  id_hospital,
}: FavoriteActions) => {
  const headersList = headers();
  const referer = headersList.get("referer") as string;

  const userId = await requireUserId();                 // ✅ JWT에서 보안적으로 추출
  const member = await findMemberByUserId(userId);      // (원하면 생략 가능)

  if (!member) {
    redirect("/login");
  }

  const memberUuid =
    (member?.uuid as string | undefined) ??
    (member?.id_uuid as string | undefined) ??
    userId!;

  const hospitalId = Number(id_hospital);

  if (!Number.isFinite(hospitalId)) {
    redirect(referer ?? "/");
  }

  if (isFavorite) {
    await q(
      `DELETE FROM ${TABLE_FAVORITE} WHERE uuid = $1 AND id_hospital = ANY($2::int[])`,
      [memberUuid, [hospitalId]]
    );
  } else {
    await q(
      `INSERT INTO ${TABLE_FAVORITE} (uuid, id_hospital, created_at, updated_at)
       VALUES ($1, $2, now(), now())
       ON CONFLICT DO NOTHING`,
      [memberUuid, hospitalId]
    );
  }

  redirect(referer ?? "/");
};
