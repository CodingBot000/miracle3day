import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/admin/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
  return NextResponse.json({ ok: true });
}