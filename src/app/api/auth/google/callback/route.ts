import { NextResponse } from "next/server";
import * as jose from "jose";
import { getIronSession } from "iron-session";
import { getSessionOptions } from "@/lib/session";
import { q } from "@/lib/db";
import { TABLE_MEMBERS, TABLE_MEMBER_SOCIAL_ACCOUNTS } from "@/constants/tables";
import { decryptOAuthState } from "@/lib/oauth";

// Base URL for redirects (always use actual request origin)
const getBaseUrl = (reqUrl: string) => new URL(reqUrl).origin;

// Check if request is secure (HTTPS)
const isSecureRequest = (reqUrl: string) => new URL(reqUrl).protocol === 'https:';

type TermsAgreements = {
  [key: string]: {
    agreed: boolean;
    required: boolean;
  };
};

async function exchangeToken(code: string, verifier: string) {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    code,
    code_verifier: verifier,
    grant_type: "authorization_code",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) throw new Error("Token exchange failed");
  return res.json();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const encryptedState = url.searchParams.get("state");

  const baseUrl = getBaseUrl(req.url);

  // Decrypt state from URL parameter (no cookies needed)
  const stateData = encryptedState ? decryptOAuthState(encryptedState) : null;

  if (!code || !stateData) {
    console.error("OAuth callback failed:", {
      code: !!code,
      stateDecrypted: !!stateData,
    });
    return NextResponse.redirect(new URL("/login?error=oauth_failed", baseUrl));
  }

  const { verifier, redirect: redirectUrl, nonce } = stateData;
  console.log("OAuth callback - state decoded from URL:", { nonce, redirectUrl });

  try {
    const token = await exchangeToken(code, verifier);
    const JWKS = jose.createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
    const { payload } = await jose.jwtVerify(token.id_token, JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    // 기존 회원 확인
    const provider = "google";
    const providerUserId = payload.sub as string;
    const email = payload.email as string;
    
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
    
    if (memberId) {
      // 기존회원인데 약관에 동의를 모두 한상태인지 체크. 원래는 동의를 해야 통과되지만 네트워크 이슈로 동의가 제대로 되지않았을 경우 다시 동의화면으로 이동시켜야함
      const termsAgreements = await q(
        `SELECT terms_agreements FROM ${TABLE_MEMBERS} WHERE id_uuid = $1`,
        [memberId]
      );
      const termsAgreementsData = termsAgreements[0]?.terms_agreements as TermsAgreements | null;
      
      if (!termsAgreementsData) {
        const res = NextResponse.redirect(new URL("/terms", baseUrl));
        const session = await getIronSession(req, res, getSessionOptions(isSecureRequest(req.url))) as any;
        session.auth = {
          provider,
          provider_user_id: providerUserId,
          email,
          avatar: payload.picture as string,
          name: payload.name as string,
          status: "pending",
        };
        await session.save();
        return res;
      }
      
      // required가 true인 항목 중 agreed가 false인 것이 있는지 확인
      const hasUnagreeRequired = Object.values(termsAgreementsData).some(
        (term) => term.required === true && term.agreed !== true
      );
      
      if (hasUnagreeRequired) {
        const res = NextResponse.redirect(new URL("/terms", baseUrl));
        const session = await getIronSession(req, res, getSessionOptions(isSecureRequest(req.url))) as any;
        session.auth = {
          provider,
          provider_user_id: providerUserId,
          email,
          avatar: payload.picture as string,
          name: payload.name as string,
          status: "pending",
        };
        await session.save();
        return res;
      }
      // ✅ Admin 권한 체크 (optional - 실패해도 로그인 진행)
      let userRole: 'user' | 'hospital_admin' | 'super_admin' = 'user';
      let hospitalAccess: Array<{ hospital_id: string; hospital_name?: string }> = [];

      try {
        const adminAccess = await q(
          `SELECT a.id_uuid_hospital, h.name_en as hospital_name
           FROM admin a
           LEFT JOIN hospital h ON h.id_uuid = a.id_uuid_hospital
           WHERE $1 = ANY(a.authorized_ids)`,
          [email]
        );

        if (adminAccess.length > 0) {
          userRole = 'hospital_admin';
          hospitalAccess = adminAccess.map(row => ({
            hospital_id: row.id_uuid_hospital,
            hospital_name: row.hospital_name,
          }));

          await q(
            `UPDATE members SET role = $1 WHERE id_uuid = $2`,
            ['hospital_admin', memberId]
          );

          console.log(`✅ Admin access granted for ${email}:`, hospitalAccess);
        } else {
          console.log(`ℹ️ No admin access for ${email}, continuing as user`);
        }
      } catch (adminError) {
        console.error('⚠️ Admin access check failed, continuing as user:', adminError);
        // userRole은 'user'로 유지
      }

      // 기존 회원 - 바로 active 상태로 설정
      // 팝업 윈도우에서 실행 중이면 자동으로 닫고, 아니면 리다이렉트
      const res = new NextResponse();
      const session = await getIronSession(req, res, getSessionOptions(isSecureRequest(req.url))) as any;

      session.auth = {
        provider,
        provider_user_id: providerUserId,
        email,
        avatar: payload.picture as string,
        name: payload.name as string,
        status: "active",
        id_uuid: memberId,
        role: userRole,
        hospitalAccess,
      };
      await session.save();

      // HTML 페이지 반환: 팝업이면 닫고, 아니면 리다이렉트
      return new NextResponse(
        `<!DOCTYPE html>
<html>
  <head>
    <title>Login Successful</title>
    <meta charset="utf-8">
  </head>
  <body>
    <script>
      if (window.opener && !window.opener.closed) {
        // 팝업 윈도우 - 부모에게 성공 알리고 닫기
        console.log('OAuth success in popup, closing...');
        window.close();
      } else {
        // 일반 윈도우 - 리다이렉트 (팝업 차단 폴백)
        console.log('OAuth success in regular window, redirecting...');
        window.location.href = '${redirectUrl}';
      }
    </script>
    <p style="text-align: center; font-family: sans-serif; margin-top: 100px;">
      Login successful! This window will close automatically...
    </p>
  </body>
</html>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Set-Cookie': res.headers.get('Set-Cookie') || '',
          },
        }
      );
    } else {
      // 신규 회원 - pending 상태로 약관 동의 페이지로
      const res = NextResponse.redirect(new URL("/terms", baseUrl));
      const session = await getIronSession(req, res, getSessionOptions(isSecureRequest(req.url))) as any;

      session.auth = {
        provider,
        provider_user_id: providerUserId,
        email,
        avatar: payload.picture as string,
        name: payload.name as string,
        status: "pending",
      };
      await session.save();
      return res;
    }
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", baseUrl));
  }
}