"use server";

import { deleteFavoriteAPI, postFavoriteAPI } from "@/app/api/auth/favorite";
import { createClient } from "@/utils/supabase/server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface FavoriteActions {
  isFavorite: boolean;
  id_hospital: string;
}

export const favoriteActions = async ({
  isFavorite,
  id_hospital,
}: FavoriteActions) => {
  const supabase = createClient();
  const referer = headers().get("referer") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const uuid = user.id;

  if (isFavorite) {
    await deleteFavoriteAPI({
      id_hospital,
      uuid,
    });

    redirect(referer);
  } else {
    await postFavoriteAPI({
      id_hospital,
      uuid,
    });

    redirect(referer);
  }
};
