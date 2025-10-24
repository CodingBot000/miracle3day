import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

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

    const res = NextResponse.redirect(new URL("/auth/terms", req.url));
    const session = await getIronSession(req, res, sessionOptions) as any;

    session.auth = {
      provider: "google",
      provider_user_id: payload.sub as string,
      email: payload.email as string,
      avatar: payload.picture as string,
      status: "pending",
    };

    await session.save();
    return res;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/auth/error", req.url));
  }
}