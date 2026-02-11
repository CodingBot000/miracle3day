import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { readAccessToken, readAdminSession } from '@/lib/auth/jwt';
import argon2 from 'argon2';


export async function POST(req: NextRequest) {
  console.log('[create-account] API 호출됨');

  // 1. 세션 검사 - 통합 JWT 우선, 기존 Admin JWT 호환
  const accessToken = await readAccessToken();
  const oldAdminSession = await readAdminSession();
  const session = accessToken || oldAdminSession;

  if (!session) {
    console.log('[create-account] ❌ 세션 없음');
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  console.log('[create-account] 세션 확인:', { email: session.email });

  if (session.email !== process.env.SUPER_ADMIN_EMAIL) {
    console.log('[create-account] ❌ 슈퍼관리자 아님:', session.email);
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  console.log('[create-account] ✅ 슈퍼관리자 확인');

  // 2. body 파싱
  const { emailLocalPart, password } = await req.json();
  console.log('[create-account] 요청 데이터:', { emailLocalPart, passwordLength: password?.length });

  if (!emailLocalPart || !password) {
    return NextResponse.json(
      { ok: false, error: 'emailLocalPart and password required' },
      { status: 400 }
    );
  }

  // 3. email 정규화
  // - 사용자가 실수로 "clinic01@beautylink.com" 을 넣었어도 중복으로 붙지 않게 처리
  const base = emailLocalPart
    .replace(/@beautylink\.com$/i, '') // 끝에 한번 붙어있다면 제거 (대소문자 무시)
    .trim();
  const finalEmail = `${base}@beautylink.com`;

  console.log('[create-account] 최종 이메일:', finalEmail);

  // 4. 중복 검사
  try {
    const exists = await pool.query(`SELECT 1 FROM admin WHERE email = $1 LIMIT 1`, [finalEmail]);

    if (exists.rowCount && exists.rowCount > 0) {
      console.log('[create-account] ❌ 중복 이메일:', finalEmail);
      return NextResponse.json({ ok: false, error: 'DUPLICATE' }, { status: 409 });
    }

    console.log('[create-account] ✅ 이메일 중복 없음');

    // 5. 비번 해시 생성 (argon2id)
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    console.log('[create-account] ✅ 비밀번호 해시 생성 완료');

    // 6. INSERT
    const { rows } = await pool.query(
      `INSERT INTO admin (
         id,
         email,
         password_hash,
         id_uuid_hospital,
         is_active,
         created_at,
         updated_at
       ) VALUES (
         gen_random_uuid(),
         $1,
         $2,
         NULL,
         true,
         now(),
         now()
       )
       RETURNING id, email, created_at;`,
      [finalEmail, hash]
    );

    console.log('[create-account] ✅ 계정 생성 완료:', rows[0]);

    return NextResponse.json({ ok: true, row: rows[0] });
  } catch (error) {
    console.error('[create-account] ❌ 데이터베이스 오류:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    );
  }
}
