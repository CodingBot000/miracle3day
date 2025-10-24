"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { q } from "@/lib/db";
import { TABLE_FAVORITE } from "@/constants/tables";
import { findMemberByUserId } from "@/app/api/auth/getUser/member.helper";

interface FavoriteActions {
  isFavorite: boolean;
  id_hospital: string;
}

export const favoriteActions = async ({
  isFavorite,
  id_hospital,
}: FavoriteActions) => {
  const referer = headers().get("referer") as string;
  const { userId } = auth();

  if (!userId) {
    redirect(referer ?? "/auth/login");
  }

  const member = await findMemberByUserId(userId!);

  if (!member) {
    redirect("/auth/login");
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
