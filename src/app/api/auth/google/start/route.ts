import { NextResponse } from "next/server";
import { randomString, toCodeChallenge, encryptOAuthState } from "@/lib/oauth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectUrl = url.searchParams.get("state") || "/";

  const nonce = randomString(16);
  const verifier = randomString(32);
  const challenge = toCodeChallenge(verifier);

  // Encrypt verifier and redirect into state parameter
  // This avoids cookie issues with cross-site redirects
  const encryptedState = encryptOAuthState({
    verifier,
    redirect: redirectUrl,
    nonce,
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: "openid email profile",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: encryptedState,
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  console.log("OAuth start - state encoded in URL parameter:", { nonce, redirectUrl });

  return NextResponse.redirect(googleAuthUrl);
}