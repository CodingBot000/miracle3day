import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { issueSession, COOKIE_NAME } from "@/lib/admin/auth";
import argon2 from "argon2";

export async function POST(req: NextRequest) {
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

  const inputPasswordHash = await argon2.hash(password);
  console.log("[AUTH-LOGIN DEBUG] Step5 hashed input password", inputPasswordHash);
  console.log("[AUTH-LOGIN DEBUG] Step6 stored password hash", user.password_hash);

  // 2) 비밀번호 검증 (argon2.verify)
  const passOk = await argon2.verify(user.password_hash, password);
  console.log("[AUTH-LOGIN DEBUG] Step7 password verification result", passOk);
  if (!passOk) {
    console.log("[AUTH-LOGIN DEBUG] Step8 verification failed", { email });
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // 3) JWT 발급
  const token = await issueSession({
    sub: user.id,
    email: user.email,
    role: "admin",
  });
  console.log("[AUTH-LOGIN DEBUG] Step9 issued session token");

  // 4) HttpOnly 쿠키 설정
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  console.log("[AUTH-LOGIN DEBUG] Step10 cookie stored");

  // 5) 프런트에서 성공 여부만 보면 되게 최소 정보 반환
  console.log("[AUTH-LOGIN DEBUG] Step11 login success response", { email });
  return NextResponse.json({ ok: true });
}
