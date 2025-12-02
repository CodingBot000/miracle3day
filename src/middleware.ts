import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { log } from '@/utils/logger';

// next-intl 미들웨어 생성
const intlMiddleware = createIntlMiddleware(routing);

// 인증이 필요한 경로 (locale prefix 없이)
const AUTH_REQUIRED_PATHS = [
  '/user',
  '/gamification/quize',
  '/withdrawal',
];

function isAuthRequiredPath(pathname: string) {
  // locale prefix 제거 후 체크 (예: /en/user -> /user)
  const pathWithoutLocale = pathname.replace(/^\/(en|ko|ja|zh-CN|zh-TW)/, '');
  return AUTH_REQUIRED_PATHS.some((p) => pathWithoutLocale.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  log.debug('[middleware] path:', path);

  // 1. 인증 체크 (locale prefix 상관없이)
  if (isAuthRequiredPath(path)) {
    log.debug('[middleware] auth required path detected:', path);
    const sessionCookie = req.cookies.get('app_session');
    log.debug('[middleware] session cookie exists:', !!sessionCookie);

    if (!sessionCookie) {
      log.debug('middleware: redirect unauthenticated user to login');
      return NextResponse.redirect(new URL('/api/auth/google/start', req.url));
    }
    log.debug('[middleware] auth check passed, continuing');
  }

  // 2. next-intl 미들웨어 실행 (locale 감지, 리다이렉트 등)
  const response = intlMiddleware(req);

  // 3. pathname 헤더 추가 (기존 로직 유지)
  response.headers.set('x-pathname', path);

  return response;
}

export const config = {
  matcher: [
    // 정적 파일, api, _next, static 폴더 제외한 모든 경로
    '/((?!api|_next|_vercel|static|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|lottie|mp4|webm|ogg|mp3|wav|pdf|xml|html)$).*)',
  ],
};
