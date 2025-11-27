import { NextRequest, NextResponse } from "next/server";
import { log } from '@/utils/logger';

const AUTH_REQUIRED_PATHS = [
  "/user",
  "/gamification/quize",
  "/withdrawal",
];

function isAuthRequiredPath(pathname: string) {
  return AUTH_REQUIRED_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  log.debug('[middleware] path:', path);

  if (isAuthRequiredPath(path)) {
    log.debug('[middleware] auth required path detected:', path);
    const sessionCookie = req.cookies.get('app_session');
    log.debug('[middleware] session cookie exists:', !!sessionCookie);
    if (!sessionCookie) {
      log.debug("middleware: redirect unauthenticated user to login");
      const redirectRes = NextResponse.redirect(new URL("/api/auth/google/start", req.url));
      return ensureLangCookie(req, redirectRes);
    }
    log.debug('[middleware] auth check passed, continuing');
  } else {
    log.debug('[middleware] public path, passing through:', path);
  }

  const response = NextResponse.next();
  // pathname을 헤더에 추가하여 layout에서 사용할 수 있게 함
  response.headers.set('x-pathname', path);
  return ensureLangCookie(req, response);
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
