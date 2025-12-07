import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { log } from '@/utils/logger';
import { jwtVerify } from 'jose';

// =============================================================================
// CONFIGURATION
// =============================================================================

// Admin JWT 설정
const ADMIN_COOKIE_NAME = 'bl_admin_session';
const ADMIN_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);

// next-intl 미들웨어 생성
const intlMiddleware = createIntlMiddleware(routing);

// 환자용 인증 필요 경로 (locale prefix 없이)
const AUTH_REQUIRED_PATHS = [
  '/user',
  '/gamification/quize',
  '/withdrawal',
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function isAuthRequiredPath(pathname: string) {
  // locale prefix 제거 후 체크 (예: /en/user -> /user)
  const pathWithoutLocale = pathname.replace(/^\/(en|ko|ja|zh-CN|zh-TW)/, '');
  return AUTH_REQUIRED_PATHS.some((p) => pathWithoutLocale.startsWith(p));
}

async function verifyAdminSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, ADMIN_SECRET);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// MAIN MIDDLEWARE
// =============================================================================

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  log.debug('[middleware] path:', pathname);

  // ========================================
  // 1. Admin 경로 보호
  // ========================================
  if (pathname.startsWith('/admin')) {
    log.debug('[middleware] admin path detected');
    
    // /admin/login은 항상 허용
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // JWT 세션 확인
    const isValidAdmin = await verifyAdminSession(req);
    
    if (!isValidAdmin) {
      log.debug('[middleware] invalid admin session, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    log.debug('[middleware] admin auth passed');
    return NextResponse.next();
  }

  // ========================================
  // 2. 환자용 경로 - 인증 체크
  // ========================================
  if (isAuthRequiredPath(pathname)) {
    log.debug('[middleware] patient auth required path detected:', pathname);
    const sessionCookie = req.cookies.get('app_session');
    log.debug('[middleware] patient session cookie exists:', !!sessionCookie);

    if (!sessionCookie) {
      log.debug('[middleware] redirect unauthenticated user to Google OAuth');
      return NextResponse.redirect(new URL('/api/auth/google/start', req.url));
    }
    log.debug('[middleware] patient auth check passed');
  }

  // ========================================
  // 3. next-intl 미들웨어 (locale 처리)
  // ========================================
  const response = intlMiddleware(req);

  // ========================================
  // 4. pathname 헤더 추가
  // ========================================
  response.headers.set('x-pathname', pathname);

  return response;
}

// =============================================================================
// MATCHER CONFIGURATION
// =============================================================================

export const config = {
  matcher: [
    // Admin 경로 보호
    '/admin/:path*',
    
    // 환자용 경로 (정적 파일, api, _next 등 제외)
    '/((?!api|_next|_vercel|static|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|lottie|mp4|webm|ogg|mp3|wav|pdf|xml|html)$).*)',
  ],
};



/**
 수정된사항

 1. Admin 보호 로직 추가
typescript// /admin 경로는 JWT 검증
if (pathname.startsWith('/admin')) {
  // /admin/login 제외
  // JWT 세션 확인
  // 실패 시 /admin/login으로
}
2. 환자/관리자 인증 분리
typescript// Admin: bl_admin_session (JWT)
// Patient: app_session (Google OAuth)
```

### 3. 처리 순서
```
1. /admin → JWT 체크 → 통과/리다이렉트
2. 환자 인증 경로 → OAuth 세션 체크
3. next-intl → locale 처리
4. pathname 헤더 추가
4. Matcher 통합
typescriptmatcher: [
  '/admin/:path*',              // Admin 보호
  '/((?!api|_next|...).*)',     // 환자용 (기존)
]
```

## 동작 예시

**케이스 1: 관리자가 /admin/dashboard 접근**
```
1. pathname.startsWith('/admin') → true
2. JWT 검증 → 성공
3. NextResponse.next()
```

**케이스 2: 비로그인 관리자가 /admin/chat 접근**
```
1. pathname.startsWith('/admin') → true
2. JWT 검증 → 실패
3. redirect → /admin/login
```

**케이스 3: 환자가 /en/user 접근**
```
1. pathname.startsWith('/admin') → false
2. isAuthRequiredPath('/en/user') → true
3. app_session 확인 → 실패
4. redirect → /api/auth/google/start
```

**케이스 4: 환자가 /ko/treatments 접근**
```
1. pathname.startsWith('/admin') → false
2. isAuthRequiredPath → false
3. intlMiddleware → locale 처리
4. NextResponse (정상)

테스트 체크리스트
bash# Admin 경로
✅ /admin/login (허용)
✅ /admin/dashboard (JWT 필요)
✅ /admin/chat (JWT 필요)

# 환자 경로
✅ /ko/treatments (공개)
✅ /en/hospitals (공개)
✅ /ko/user (app_session 필요)
✅ /en/withdrawal (app_session 필요)

# API
✅ /api/admin/* (통과)
✅ /api/auth/* (통과)

 */



// import { NextRequest, NextResponse } from 'next/server';
// import createIntlMiddleware from 'next-intl/middleware';
// import { routing } from '@/i18n/routing';
// import { log } from '@/utils/logger';

// // next-intl 미들웨어 생성
// const intlMiddleware = createIntlMiddleware(routing);

// // 인증이 필요한 경로 (locale prefix 없이)
// const AUTH_REQUIRED_PATHS = [
//   '/user',
//   '/gamification/quize',
//   '/withdrawal',
// ];

// function isAuthRequiredPath(pathname: string) {
//   // locale prefix 제거 후 체크 (예: /en/user -> /user)
//   const pathWithoutLocale = pathname.replace(/^\/(en|ko|ja|zh-CN|zh-TW)/, '');
//   return AUTH_REQUIRED_PATHS.some((p) => pathWithoutLocale.startsWith(p));
// }

// export async function middleware(req: NextRequest) {
//   const path = req.nextUrl.pathname;
//   log.debug('[middleware] path:', path);

//   // 1. 인증 체크 (locale prefix 상관없이)
//   if (isAuthRequiredPath(path)) {
//     log.debug('[middleware] auth required path detected:', path);
//     const sessionCookie = req.cookies.get('app_session');
//     log.debug('[middleware] session cookie exists:', !!sessionCookie);

//     if (!sessionCookie) {
//       log.debug('middleware: redirect unauthenticated user to login');
//       return NextResponse.redirect(new URL('/api/auth/google/start', req.url));
//     }
//     log.debug('[middleware] auth check passed, continuing');
//   }

//   // 2. next-intl 미들웨어 실행 (locale 감지, 리다이렉트 등)
//   const response = intlMiddleware(req);

//   // 3. pathname 헤더 추가 (기존 로직 유지)
//   response.headers.set('x-pathname', path);

//   return response;
// }

// export const config = {
//   matcher: [
//     // 정적 파일, api, _next, static 폴더 제외한 모든 경로
//     '/((?!api|_next|_vercel|static|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|lottie|mp4|webm|ogg|mp3|wav|pdf|xml|html)$).*)',
//   ],
// };
