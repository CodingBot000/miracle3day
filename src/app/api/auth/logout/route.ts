import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth/jwt";

export async function POST() {
  try {
    const res = NextResponse.json({ success: true });

    // JWT 쿠키 삭제
    clearAuthCookies(res);

    // 기존 iron-session 쿠키도 삭제 (마이그레이션 호환)
    res.cookies.set("app_session", "", { maxAge: 0, path: "/" });

    return res;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}