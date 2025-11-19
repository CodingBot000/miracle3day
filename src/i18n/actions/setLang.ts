
"use server";

import { cookies } from "next/headers";
import type { Lang } from "@/i18n/i18n";

export async function setLangAction(nextLang: Lang) {
  const lang: Lang = nextLang === "ko" ? "ko" : "en";

  cookies().set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
