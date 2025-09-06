"use server";

import { ROUTE } from "@/router";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  console.log('[LogoutAction] Starting logout process...');
  
  const supabase = createClient();
  console.log('[LogoutAction] Calling supabase.auth.signOut()...');
  
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[LogoutAction] Supabase signOut error:', error);
  } else {
    console.log('[LogoutAction] Supabase signOut successful');
  }
  
  // 쿠키 삭제
  console.log('[LogoutAction] Deleting cookies...');
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  console.log('[LogoutAction] Found cookies to delete:', allCookies.map(c => c.name));
  
  allCookies.forEach(cookie => {
    cookieStore.delete(cookie.name);
    console.log('[LogoutAction] Deleted cookie:', cookie.name);
  });
  
  console.log('[LogoutAction] Clearing user store...');
  useUserStore.getState().clearUser();
  
  console.log('[LogoutAction] Redirecting to home...');
  redirect(ROUTE.HOME);
}
