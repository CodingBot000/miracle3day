import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * 완전 공개 경로 (로그인 여부 관계없이 접근 가능)
 */
const PUBLIC_PATHS = [
  "/",                         // 홈
  "/api/storage/read",          // Lightsail presigned proxy
  "/api/health",                // 헬스체크
  "/api/auth/terms/agree",      // 약관동의
  "/api/onboarding/complete",   // 온보딩 완료
];

/**
 * 로그인 사용자 전용 경로 (비로그인 시 접근 불가)
 */
const AUTH_REQUIRED_PATHS = [
  "/user",                      // 마이페이지 계열
  "/gamification/quize",        // 퀴즈 페이지
  "/auth/withdrawal",           // ✅ 회원탈퇴 (로그인 필요)
];

/**
 * 로그인 상태에서 접근 제한 경로 (비로그인 상태에서만 접근 가능)
 */
const AUTH_BLOCKED_PATHS = [
  "/auth/login",
  "/auth/sign-up",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isAuthRequiredPath(pathname: string) {
  return AUTH_REQUIRED_PATHS.some((p) => pathname.startsWith(p));
}

function isAuthBlockedPath(pathname: string) {
  return AUTH_BLOCKED_PATHS.some((p) => pathname.startsWith(p));
}

const handler = clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = auth();
  const path = req.nextUrl.pathname;
  console.log('[middleware] path:', path);

  // ✅ 1️⃣ 완전 공개 경로 → 통과
  if (isPublicPath(path)) {
    return ensureLangCookie(req, NextResponse.next());
  }

  // ✅ 2️⃣ 로그인 필수 경로 → 로그인 안 되어 있으면 로그인 페이지로
  if (isAuthRequiredPath(path) && !userId) {
    console.log("middleware: redirect unauthenticated user to login");
    const res = NextResponse.redirect(new URL("/auth/login", req.url));
    return ensureLangCookie(req, res);
  }

  // ✅ 3️⃣ 로그인 상태에서 접근 제한 경로 → 홈으로 리다이렉트
  if (userId && isAuthBlockedPath(path)) {
    const res = NextResponse.redirect(new URL("/", req.url));
    return ensureLangCookie(req, res);
  }

  // ✅ 4️⃣ 나머지 → 통과
  return ensureLangCookie(req, NextResponse.next());
});

export default handler;

export const config = {
  matcher: [
    // Clerk 인증 감지 대상 (정적파일, 이미지 제외, /api/auth는 포함)
    "/((?!_next/static|_next/image|favicon.png|favicon.ico|api/(?!auth).*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|lottie)$).*)",
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
