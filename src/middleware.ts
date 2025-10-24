import { NextRequest, NextResponse } from "next/server";

const AUTH_REQUIRED_PATHS = [
  "/user",
  "/gamification/quize",
  "/auth/withdrawal",
];

function isAuthRequiredPath(pathname: string) {
  return AUTH_REQUIRED_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log('[middleware] path:', path);

  if (isAuthRequiredPath(path)) {
    console.log('[middleware] auth required path detected:', path);
    const sessionCookie = req.cookies.get('app_session');
    console.log('[middleware] session cookie exists:', !!sessionCookie);
    if (!sessionCookie) {
      console.log("middleware: redirect unauthenticated user to login");
      const redirectRes = NextResponse.redirect(new URL("/api/auth/google/start", req.url));
      return ensureLangCookie(req, redirectRes);
    }
    console.log('[middleware] auth check passed, continuing');
  } else {
    console.log('[middleware] public path, passing through:', path);
  }

  return ensureLangCookie(req, NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.png|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|lottie)$).*)",
  ],
};

/**
 * 다국어 쿠키(lang) 세팅 헬퍼
 */
function ensureLangCookie(req: NextRequest, res: NextResponse) {
  if (req.cookies.get("lang")) return res;

  const al = (req.headers.get("accept-language") || "").toLowerCase();
  const lang = al.startsWith("ko") ? "ko" : "en";

  res.cookies.set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return res;
}
