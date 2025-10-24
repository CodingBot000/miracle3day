import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { q } from "@/lib/db";
import { TABLE_MEMBERS, TABLE_MEMBER_SOCIAL_ACCOUNTS } from "@/constants/tables";

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
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oidc_state")?.value;
  const verifier = cookieStore.get("pkce_verifier")?.value;
  
  if (!code || !state || state !== savedState || !verifier) {
    return NextResponse.redirect(new URL("/auth/error", req.url));
  }

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
      // 기존 회원 - 바로 active 상태로 설정
      const res = NextResponse.redirect(new URL("/", req.url));
      const session = await getIronSession(req, res, sessionOptions) as any;
      
      session.auth = {
        provider,
        provider_user_id: providerUserId,
        email,
        avatar: payload.picture as string,
        status: "active",
        id_uuid: memberId,
      };
      await session.save();
      return res;
    } else {
      // 신규 회원 - pending 상태로 약관 동의 페이지로
      const res = NextResponse.redirect(new URL("/auth/terms", req.url));
      const session = await getIronSession(req, res, sessionOptions) as any;
      
      session.auth = {
        provider,
        provider_user_id: providerUserId,
        email,
        avatar: payload.picture as string,
        status: "pending",
      };
      await session.save();
      return res;
    }
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/auth/error", req.url));
  }
}