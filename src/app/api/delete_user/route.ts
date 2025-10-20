import { useUserStore } from "@/stores/useUserStore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { uid } = await req.json();
  console.warn(`[delete-user] Requested deletion for uid=${uid}, but auth backend is disabled.`);

  useUserStore.getState().clearUser();

  return NextResponse.json({
    success: true,
    message: "User deletion is skipped because the Supabase backend is disabled.",
  });
}
