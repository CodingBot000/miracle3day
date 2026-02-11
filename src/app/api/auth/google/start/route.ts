import { NextResponse } from "next/server";
import { randomString, toCodeChallenge, encryptOAuthState } from "@/lib/oauth";

export async function GET(req: Request) {
  try {
    console.log("[OAuth Start] Request received");

    const url = new URL(req.url);
    const redirectUrl = url.searchParams.get("state") || "/";
    console.log("[OAuth Start] Redirect URL:", redirectUrl);

    // Check required environment variables
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("[OAuth Start] ❌ GOOGLE_CLIENT_ID not set");
      return NextResponse.json(
        { error: "OAuth configuration error: GOOGLE_CLIENT_ID missing" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_REDIRECT_URI) {
      console.error("[OAuth Start] ❌ GOOGLE_REDIRECT_URI not set");
      return NextResponse.json(
        { error: "OAuth configuration error: GOOGLE_REDIRECT_URI missing" },
        { status: 500 }
      );
    }

    const nonce = randomString(16);
    const verifier = randomString(32);
    const challenge = toCodeChallenge(verifier);

    // Encrypt verifier and redirect into state parameter
    // This avoids cookie issues with cross-site redirects
    console.log("[OAuth Start] Encrypting state...");
    const encryptedState = encryptOAuthState({
      verifier,
      redirect: redirectUrl,
      nonce,
    });
    console.log("[OAuth Start] State encrypted successfully");

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      code_challenge: challenge,
      code_challenge_method: "S256",
      state: encryptedState,
      prompt: "select_account",  // 항상 계정 선택 화면 표시
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

    console.log("[OAuth Start] Redirecting to Google:", googleAuthUrl.substring(0, 100) + "...");

    return NextResponse.redirect(googleAuthUrl, { status: 303 });
  } catch (error) {
    console.error("[OAuth Start] ❌ Error:", error);
    return NextResponse.json(
      {
        error: "OAuth initialization failed",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}