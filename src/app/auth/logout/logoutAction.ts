"use server";

import { ROUTE } from "@/router";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  
  // 쿠키 삭제
  const cookieStore = cookies();
  cookieStore.getAll().forEach(cookie => {
    cookieStore.delete(cookie.name);
  });
  useUserStore.getState().clearUser();
  // 홈으로 리다이렉트
  // redirect("/");
  redirect(ROUTE.HOME);
}
