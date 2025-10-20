"use server";

import { createActionRedirectUrl } from "@/utils";
import { createClient } from "@/utils/session/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SNS_FACEBOOK, SNS_GOOGLE, SNS_APPLE } from "@/constants/key";

export type TSnsType = typeof SNS_FACEBOOK | typeof SNS_GOOGLE | typeof SNS_APPLE;

export const snsLoginActions = async (prevState: any, snsType: TSnsType) => {
  const referer = headers().get("referer") as string;
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const sessionClient = createClient();

  // 동적으로 callback URL 생성
  const callbackUrl = process.env.NEXT_PUBLIC_API_ROUTE 
    ? `${process.env.NEXT_PUBLIC_API_ROUTE}/auth/callback`
    : `${protocol}://${host}/auth/callback`;

  const { error, data } = await sessionClient.auth.signInWithOAuth({
    provider: snsType,
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      scopes: snsType === "google" ? "email profile" : undefined,
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) {
    console.error(`SNS Login Error [${snsType}]:`, error);
    redirect(createActionRedirectUrl(referer, `SNS 로그인 실패: ${error?.message}`));
  }
};
