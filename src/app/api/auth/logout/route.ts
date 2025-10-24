import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

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

    // Clear all cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    const response = NextResponse.json({ success: true });
    
    // Delete all cookies by setting them to expire
    allCookies.forEach(cookie => {
      response.cookies.delete(cookie.name);
      response.cookies.set(cookie.name, '', {
        expires: new Date(0),
        path: '/',
        domain: undefined
      });
    });
    
    return response;
    
  } catch (error) {
    console.error('Server logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
