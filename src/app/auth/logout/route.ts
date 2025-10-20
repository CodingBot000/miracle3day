import { createClient } from "@/utils/session/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const backendClient = createClient();
    
    // 로그아웃 처리
    await backendClient.auth.signOut();
    
    // 쿠키 삭제
    const cookieStore = cookies();
    cookieStore.getAll().forEach(cookie => {
      cookieStore.delete(cookie.name);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
} 