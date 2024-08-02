"use server";

import { createActionRedirectUrl } from "@/utils";
import { createClient } from "@/utils/supabase/server";
import { Provider } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type TSnsType = Extract<Provider, "facebook" | "google" | "apple">;

export const snsLoginActions = async (prevState: any, snsType: TSnsType) => {
  const referer = headers().get("referer") as string;

  const supabase = createClient();

  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: snsType,
    options: {
      redirectTo: process.env.NEXT_PUBLIC_API_ROUTE + "/auth/callback",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) {
    redirect(createActionRedirectUrl(referer, error?.message));
  }
};
