
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Lang } from "../i18n";

export async function setLangAction(formData: FormData) {
  const nextLang = (formData.get("lang") as Lang) || "en";
  cookies().set("lang", nextLang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // 캐시 사용 중이면 필요한 경로 revalidate. force-dynamic이면 없어도 OK.
  revalidatePath("/", "layout");
}
