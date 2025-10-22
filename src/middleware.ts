import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

import { createClient } from "./utils/session/server";
import { updateSession } from "./utils/session/middleware";

const handler = clerkMiddleware(async (_auth, req: NextRequest) => {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const backendClient = createClient();
  const auth = await backendClient.auth.getUser();

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
      const res = NextResponse.redirect(new URL("/", req.url));
      return ensureLangCookie(req, res);
    }
    console.log('middleware.ts auth.data.user redirect / no');
  } else {
    console.log('middleware.ts not  login user');
    // not login user
    if (req.nextUrl.pathname.startsWith("/user")) {
      const res = NextResponse.redirect(new URL("/", req.url));
      return ensureLangCookie(req, res);
    }

    // 퀴즈 페이지는 로그인 필수
    if (req.nextUrl.pathname.startsWith("/gamification/quize")) {
      console.log('middleware.ts redirect to login from quiz page');
      const res = NextResponse.redirect(new URL("/auth/login", req.url));
      return ensureLangCookie(req, res);
    }

    // if (req.nextUrl.pathname.startsWith("/admin")) {
    //   return NextResponse.redirect(new URL("/", req.url));
    // }
  }
  console.log('middleware.ts all path:', req.nextUrl.pathname);
  const res = await updateSession(req);
  return ensureLangCookie(req, res);
});

export default handler;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.(png|ico) (favicon files)
     * - lottie files
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.png|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|lottie)$).*)",
    "/api/auth/terms/agree",
    "/api/onboarding/complete",
  ],
};


function ensureLangCookie(req: NextRequest, res: NextResponse) {
  // 이미 lang 쿠키가 있으면 그대로 반환 (절대 덮어쓰지 않음)
  if (req.cookies.get("lang")) return res;

  const al = (req.headers.get("accept-language") || "").toLowerCase();
  const lang = al.startsWith("ko") ? "ko" : "en";

  res.cookies.set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  return res;
}
