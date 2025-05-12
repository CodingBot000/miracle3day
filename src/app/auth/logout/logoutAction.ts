"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ROUTE } from "@/router";

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect(ROUTE.HOME);
}
