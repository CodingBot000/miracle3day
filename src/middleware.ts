import { NextRequest, NextResponse } from "next/server";

import { createClient } from "./utils/supabase/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(req: NextRequest) {
  const supabase = createClient();

  const auth = await supabase.auth.getUser();

  if (auth.data.user) {
    const allowedAuthPaths = ["/auth/withdrawal"];
    // login user
    // if (auth.data.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    //   if (req.nextUrl.pathname.startsWith("/admin")) {
    //     return NextResponse.redirect(new URL("/", req.url));
    //   }
    // }
    // const allowedAuthPaths = ["/auth/sign-up/complete-profile", "/auth/logout"];
    console.log('middleware.ts auth.data.user req.nextUrl.pathname:' , req.nextUrl.pathname);
    
    
    if (req.nextUrl.pathname.startsWith("/auth")
    &&  !allowedAuthPaths.some((path) => req.nextUrl.pathname.startsWith(path))) 
    
     {
      console.log('middleware.ts auth.data.user redirect /');
      return NextResponse.redirect(new URL("/", req.url));
    }
    console.log('middleware.ts auth.data.user redirect / no');
  } else {
    console.log('middleware.ts not  login user');
    // not login user
    if (req.nextUrl.pathname.startsWith("/user")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 퀴즈 페이지는 로그인 필수
    if (req.nextUrl.pathname.startsWith("/gamification/quize")) {
      console.log('middleware.ts redirect to login from quiz page');
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // if (req.nextUrl.pathname.startsWith("/admin")) {
    //   return NextResponse.redirect(new URL("/", req.url));
    // }
  }

  return await updateSession(req);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - lottie files
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|api|_next/image|favicon.png|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|lottie)$).*)",
  ],
};
