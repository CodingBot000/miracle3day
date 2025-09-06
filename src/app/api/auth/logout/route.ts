import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = createClient();
    
    // Sign out from server-side Supabase
    await supabase.auth.signOut();

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