import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { sessionId } = auth();
    if (sessionId) {
      try {
        await clerkClient.sessions.revokeSession(sessionId);
      } catch (err) {
        console.error("Failed to revoke Clerk session:", err);
      }
    }

    const cookieStore = cookies();
    cookieStore.getAll().forEach((cookie) => {
      cookieStore.delete(cookie.name);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
