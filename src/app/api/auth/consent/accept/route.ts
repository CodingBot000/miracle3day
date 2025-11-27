import { log } from '@/utils/logger';
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { TABLE_MEMBERS, TABLE_MEMBER_SOCIAL_ACCOUNTS } from "@/constants/tables";
import { initializeBadgeSystem } from "@/services/badges/initialization";
import { generateNickname } from "@/app/utils/generateNickname";

export async function POST(req: Request) {
  const res = new NextResponse();
  const session = await getIronSession(req, res, sessionOptions) as any;
  const auth = session.auth;

  if (!auth || auth.status !== "pending") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 약관 동의 정보 받기
  const body = await req.json();
  const marketingOptIn = body.marketingOptIn === true;

  const provider = auth.provider; // 'google' | 'apple' | 'facebook'
  const providerUserId = auth.provider_user_id as string;
  const email: string | null = auth.email ?? null;   // 이메일이 없어도 null 허용
  const avatar: string | null = auth.avatar ?? null;
  const name: string | null = auth.name ?? null;     // 구글에서 가져온 이름

  // 약관 동의 정보 구성
  const termsAgreement = {
    "age_14_or_older": { "agreed": true, "required": true },
    "terms_of_service": { "agreed": true, "required": true },
    "location_terms": { "agreed": true, "required": true },
    "personal_info": { "agreed": true, "required": true },
    "marketing_ads": { "agreed": marketingOptIn, "required": false }
  };

  // --- 트랜잭션 시작 ---
  try {
    await q("BEGIN");

    // 1) 소셜 연결로 기존 회원 찾기 (이메일이 없어도 탐색 가능)
    let rows = await q(
      `
      SELECT m.id_uuid
      FROM ${TABLE_MEMBER_SOCIAL_ACCOUNTS} s
      JOIN ${TABLE_MEMBERS} m ON m.id_uuid = s.member_id_uuid
      WHERE s.provider = $1 AND s.provider_user_id = $2
      LIMIT 1
      `,
      [provider, providerUserId]
    );

    let memberId: string | null = rows[0]?.id_uuid ?? null;

    // 2) 소셜로 못 찾았고, 이메일이 있으면 이메일로 기존 회원 탐색
    if (!memberId && email) {
      rows = await q(
        `SELECT id_uuid FROM ${TABLE_MEMBERS} WHERE email = $1 LIMIT 1`,
        [email]
      );
      memberId = rows[0]?.id_uuid ?? null;
    }

    // 3) 그래도 없으면 신규 멤버 생성 (email 없어도 생성)
    /**
     * 설명주석 삭제 금지 ** 절대로 삭제하지말것 **
     * 이메일이 null 로 떨어질 수 있는 경우

Google 계정에 이메일이 비공개로 설정된 경우

일부 사용자가 구글 계정 개인정보 보호 설정에서
“이메일 주소를 앱과 공유하지 않음” 으로 설정해둡니다.

이때 Google이 보내주는 id_token payload에는 email 필드 자체가 없습니다.
대신 sub(고유 사용자 ID)만 존재합니다.

Apple 로그인 (Sign in with Apple)

애플은 기본적으로 ‘Hide my email’을 활성화할 수 있습니다.
이 경우 Apple이 임시 랜덤 이메일 (abcd@privaterelay.appleid.com) 을 발급하거나,
아예 email claim이 비어있을 수 있습니다.

Facebook / 일부 OAuth Provider

사용자 계정이 전화번호 기반으로만 가입된 경우
(이메일 미등록 상태) → email 필드가 없습니다.

OAuth 스코프 누락

scope=openid email profile 에서 email 누락되면
Google도 이메일을 반환하지 않습니다.
     */
    if (!memberId) {
      const nickname = generateNickname(); // 랜덤 닉네임 자동 생성
      const created = await q(
        `
        INSERT INTO ${TABLE_MEMBERS} (email, avatar, nickname, name, is_active, terms_agreements, created_at, updated_at)
        VALUES ($1, $2, $3, $4, true, $5::jsonb, now(), now())
        RETURNING id_uuid
        `,
        [email, avatar, nickname, name, JSON.stringify(termsAgreement)]
      );
      memberId = created[0].id_uuid as string;
    } else {
      // 기존 멤버 활성화/갱신 및 약관 동의 업데이트
      await q(
        `
        UPDATE ${TABLE_MEMBERS}
           SET is_active = true,
               avatar    = COALESCE($1, avatar),
               terms_agreements = $3::jsonb,
               updated_at= now()
         WHERE id_uuid   = $2
        `,
        [avatar, memberId, JSON.stringify(termsAgreement)]
      );
    }

    // 4) 소셜 계정 upsert (member_id_uuid, provider_email 포함)
    await q(
      `
      INSERT INTO ${TABLE_MEMBER_SOCIAL_ACCOUNTS}
        (member_id_uuid, provider, provider_user_id, provider_email, created_at, updated_at)
      VALUES ($1, $2, $3, $4, now(), now())
      ON CONFLICT (provider, provider_user_id)
      DO UPDATE SET
        member_id_uuid = EXCLUDED.member_id_uuid,
        provider_email = EXCLUDED.provider_email,
        updated_at     = now()
      `,
      [memberId, provider, providerUserId, email]
    );

    await q("COMMIT");

    // ✨ 배지 시스템 초기화 (Non-Blocking)
    // await 없이 실행하여 회원가입 응답 속도에 영향 없게
    initializeBadgeSystem(memberId).catch(err => {
      console.error('Badge init background error:', err);
    });

    // 5) 세션 active로 승격
    session.auth = {
      ...session.auth,
      status: "active",
      id_uuid: memberId,
    };

    log.debug('Before session.save(), session.auth:', session.auth);
    await session.save();
    log.debug('After session.save() completed');
    // 설명: 본 주석 삭제금지 - { headers: res.headers }); header를 추가해야 session.save()로 업데이트된 쿠키가 포함되서 새응답으로 전달되어 업데이트된 세션쿠키를 받아 status를 최신상태로 받을수있다.
    return NextResponse.json({ ok: true, member_id: memberId }, { headers: res.headers });
  } catch (e) {
    await q("ROLLBACK");
    console.error("Consent accept error:", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
