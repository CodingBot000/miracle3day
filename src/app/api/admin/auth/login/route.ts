import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hash, verify } from "@node-rs/argon2";
import rateLimit from "@/lib/rate-limit";
import { generateTokenPair, setAuthCookies } from "@/lib/auth/jwt";
import type { TokenPayloadInput } from "@/lib/auth/types";

// Rate limiter 생성 (1분에 5번)
const limiter = rateLimit({
  interval: 60 * 1000, // 1분 = 60,000ms
});

// 디버깅용 GET 엔드포인트
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Login API is working",
    argon2Loaded: typeof hash !== 'undefined' && typeof verify !== 'undefined',
    nodeVersion: process.version,
    platform: process.platform,
  });
}

export async function POST(req: NextRequest) {
  // ============================================
  // Rate Limiting 체크
  // ============================================
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             req.headers.get('x-real-ip') ||
             'unknown';

  try {
    await limiter.check(5, ip); // IP당 1분에 5번만 허용
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: '로그인 시도 횟수가 너무 많습니다. 1분 후 다시 시도해주세요.',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      { status: 429 }
    );
  }

  // ============================================
  // 기존 로그인 로직
  // ============================================
  const { email, password } = await req.json();
  console.log("[AUTH-LOGIN DEBUG] Step1 received credentials", { email, password });

  // 1) admin 테이블에서 유저 조회
  const { rows } = await pool.query(
    `SELECT id, email, password_hash, is_active
     FROM public.admin
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  console.log("[AUTH-LOGIN DEBUG] Step2 query result count", rows.length);

  const user = rows[0];
  console.log("[AUTH-LOGIN DEBUG] Step3 fetched user record", user);

  // 없는 계정 / 비활성 계정
  if (!user || user.is_active === false) {
    console.log("[AUTH-LOGIN DEBUG] Step4 user missing or inactive", { email, hasUser: !!user, isActive: user?.is_active });
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const inputPasswordHash = await hash(password);
  console.log("[AUTH-LOGIN DEBUG] Step5 hashed input password", inputPasswordHash);
  console.log("[AUTH-LOGIN DEBUG] Step6 stored password hash", user.password_hash);

  // 2) 비밀번호 검증 (@node-rs/argon2)
  const passOk = await verify(user.password_hash, password);
  console.log("[AUTH-LOGIN DEBUG] Step7 password verification result", passOk);
  if (!passOk) {
    console.log("[AUTH-LOGIN DEBUG] Step8 verification failed", { email });
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // 3) 통합 JWT 발급
  const tokenInput: TokenPayloadInput = {
    sub: String(user.id),
    email: user.email,
    role: "admin",
    status: "active",
    provider: "email",
  };
  const tokens = await generateTokenPair(tokenInput);
  console.log("[AUTH-LOGIN DEBUG] Step9 issued JWT tokens");

  // 4) HttpOnly 쿠키 설정
  const res = NextResponse.json({ ok: true });
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  console.log("[AUTH-LOGIN DEBUG] Step10 JWT cookies set");
  console.log("[AUTH-LOGIN DEBUG] 환경:", {
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
  });

  // 5) 프런트에서 성공 여부만 보면 되게 최소 정보 반환
  console.log("[AUTH-LOGIN DEBUG] Step11 login success response", { email });
  return res;
}
