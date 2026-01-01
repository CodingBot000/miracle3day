import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { q } from "@/lib/db";
import { TABLE_MEMBERS, TABLE_MEMBER_SOCIAL_ACCOUNTS } from "@/constants/tables";
import { generateTokenPair, setAuthCookies } from "@/lib/auth/jwt";
import type { TokenPayloadInput } from "@/lib/auth/types";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

type TermsAgreements = {
  [key: string]: {
    agreed: boolean;
    required: boolean;
  };
};

/**
 * Android WebView에서 Google ID Token을 받아 검증하는 API
 * POST /api/auth/google/token
 * Body: { idToken: string, redirectUrl?: string }
 */
export async function POST(req: Request) {
  try {
    const { idToken, redirectUrl = "/" } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "idToken is required" },
        { status: 400 }
      );
    }

    // Google ID Token 검증
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 }
      );
    }

    const provider = "google";
    const providerUserId = payload.sub;
    const email = payload.email as string;
    const name = payload.name as string;
    const avatar = payload.picture as string;

    // 기존 회원 확인 (소셜 계정으로)
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

    // 소셜로 못 찾았고, 이메일이 있으면 이메일로 기존 회원 탐색
    if (!memberId && email) {
      rows = await q(
        `SELECT id_uuid FROM ${TABLE_MEMBERS} WHERE email = $1 LIMIT 1`,
        [email]
      );
      memberId = rows[0]?.id_uuid ?? null;
    }

    // 응답 데이터 및 토큰 입력 준비
    let responseData: {
      success: boolean;
      needsTerms?: boolean;
      redirectUrl: string;
      isNewUser?: boolean;
    };
    let tokenInput: TokenPayloadInput;

    if (memberId) {
      // 기존 회원 - 약관 동의 상태 확인
      const termsAgreements = await q(
        `SELECT terms_agreements FROM ${TABLE_MEMBERS} WHERE id_uuid = $1`,
        [memberId]
      );
      const termsAgreementsData = termsAgreements[0]
        ?.terms_agreements as TermsAgreements | null;

      // 약관 미동의 상태 확인
      const needsTerms =
        !termsAgreementsData ||
        Object.values(termsAgreementsData).some(
          (term) => term.required === true && term.agreed !== true
        );

      if (needsTerms) {
        // 약관 동의 필요 - pending 상태
        tokenInput = {
          sub: `pending:${providerUserId}`,
          email,
          role: "user",
          status: "pending",
          provider: "google",
          providerUserId,
          name,
          avatar,
        };
        responseData = {
          success: true,
          needsTerms: true,
          redirectUrl: "/terms",
        };
      } else {
        // 기존 회원 - 정상 로그인 (active 상태)
        tokenInput = {
          sub: memberId,
          email,
          role: "user",
          status: "active",
          provider: "google",
          providerUserId,
          name,
          avatar,
        };
        responseData = {
          success: true,
          needsTerms: false,
          redirectUrl,
        };
      }
    } else {
      // 신규 회원 - 약관 동의 페이지로 (pending 상태)
      tokenInput = {
        sub: `pending:${providerUserId}`,
        email,
        role: "user",
        status: "pending",
        provider: "google",
        providerUserId,
        name,
        avatar,
      };
      responseData = {
        success: true,
        needsTerms: true,
        redirectUrl: "/terms",
        isNewUser: true,
      };
    }

    // JWT 토큰 발급 및 쿠키 설정
    const tokens = await generateTokenPair(tokenInput);
    const res = NextResponse.json(responseData);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return res;
  } catch (error) {
    console.error("Google token verification error:", error);
    return NextResponse.json(
      { error: "Token verification failed" },
      { status: 401 }
    );
  }
}
