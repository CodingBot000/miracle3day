
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function requireUserId(): Promise<string> {
  const session = await getIronSession(cookies(), sessionOptions);
  const auth = (session as any).auth;

  if (!auth || auth.status !== "active" || !auth.id_uuid) {
    redirect("/auth/login"); // 로그인 페이지로 즉시 이동 (throw)
  }
  return auth.id_uuid as string;
}
