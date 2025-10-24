import { NextResponse } from "next/server";
import { randomString, toCodeChallenge } from "@/lib/oauth";
import { cookies } from "next/headers";

export async function GET() {
  const state = randomString(16);
  const verifier = randomString(32);
  const challenge = toCodeChallenge(verifier);

  const cookieStore = await cookies();
  cookieStore.set("oidc_state", state, { httpOnly: true, maxAge: 300, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  cookieStore.set("pkce_verifier", verifier, { httpOnly: true, maxAge: 300, sameSite: "lax", secure: process.env.NODE_ENV === "production" });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: "openid email profile",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}