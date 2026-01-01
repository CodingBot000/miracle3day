import { NextResponse } from "next/server";
import { clearAuthCookies, ADMIN_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // 통합 JWT 쿠키 삭제
  clearAuthCookies(res);

  // 기존 Admin JWT 쿠키도 삭제 (호환)
  res.cookies.set(ADMIN_COOKIE_NAME, "", { maxAge: 0, path: "/" });

  return res;
}