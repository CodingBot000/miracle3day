import { createBrowserClient } from "@supabase/ssr";

const keepLoggedIn = true; // 체크 여부


export const createClient = () =>
  createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: "sb-user-token",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: keepLoggedIn
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)  // 30일
        : undefined, // 브라우저 닫으면 세션 만료
        path: "/",
        httpOnly: false,
      }
    }
  );

  