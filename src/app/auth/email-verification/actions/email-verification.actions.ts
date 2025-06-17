"use server";

import { country } from "@/constants/country";
import { ROUTE } from "@/router";

import { createClient } from "@/utils/supabase/server";
import { AuthError, PostgrestError } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const verifyActions = async (prevState: any, formData: FormData) => {
  const supabase = createClient();

  const requestHeaders = headers();
  const fullUrl = requestHeaders.get("referer") || "";

  const url = new URL(fullUrl);
  const searchParams = new URLSearchParams(url.search);

  const userInfo = Object.fromEntries(searchParams.entries());

  const code = formData.get("code") as string;

  if (!userInfo.email) {
    throw new Error("userInfo.email is required");
  }

  const verifyCode = await supabase.auth.verifyOtp({
    email: userInfo.email,
    token: code,
    type: "email",
  });

  if (verifyCode.error) {
    return {
      ...prevState,
      message: verifyCode.error.code as string,
    };
  }

  const countryCode = country.find(
    (e) => e.country_name === userInfo.country_name
  );

  const insertDb: Record<string, string> = {};
  const requireKey = ["email", "nickname", "name"];

  for (let key in userInfo) {
    // if (requireKey.includes(key)) insertDb[key] = userInfo[key];
    const value = userInfo[key];
    if (requireKey.includes(key) && typeof value === "string") {
      insertDb[key] = value;
    }
  }

  if (!insertDb) {
    throw new Error("insertDb is required");
  }

  const getUser = await supabase
    .from("user")
    .select("user_no")
    .limit(1)
    .order("user_no", { ascending: false });

  if (getUser.error) {
    return {
      ...prevState,
      message: getUser.error.message || getUser.error.code,
    };
  }

  const uuid = verifyCode.data.user?.id;
  const id_country = countryCode?.id;
  const user_no = getUser.data[0]?.user_no + 1;

  // user 테이블 insert
  const saveUserProfile = await supabase
    .from("user")
    .insert([{ ...insertDb, id_country, uuid, user_no }]);

  if (saveUserProfile.error) {
    return {
      ...prevState,
      message: `verify failed\n${saveUserProfile.error.code}`,
    };
  }

  redirect(ROUTE.HOME);
};

export default verifyActions;
