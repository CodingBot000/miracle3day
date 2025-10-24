"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
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
  const referer = headers().get("referer") as string;
  
  // Server Action에서는 cookies()를 사용하여 세션 확인
  // const { cookies } = await import("next/headers");
  // const cookieStore = cookies();
  // const sessionCookie = cookieStore.get("app_session");
  
  // if (!sessionCookie) {
  //   redirect(referer ?? "/auth/login");
  // }
  
  const userId = await requireUserId();                 // ✅ 세션에서 보안적으로 추출
  const member = await findMemberByUserId(userId);      // (원하면 생략 가능)

  if (!member) {
    redirect("/auth/login");
  }

  // 세션에서 사용자 ID 추출 (간단한 방법)
  // let userId: string | null = null;
  // try {
  //   // iron-session 디코딩은 복잡하므로 임시로 쿠키 존재만 확인
  //   // 실제로는 별도 헬퍼 함수나 미들웨어에서 처리해야 함
  //   userId = "temp-user-id"; // 임시 처리
  // } catch {
  //   redirect(referer ?? "/auth/login");
  // }
  
  // if (!userId) {
  //   redirect(referer ?? "/auth/login");
  // }

  // const member = await findMemberByUserId(userId!);

  // if (!member) {
  //   redirect("/auth/login");
  // }

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
