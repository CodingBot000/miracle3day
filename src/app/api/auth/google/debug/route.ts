import { NextResponse } from "next/server";

/**
 * Debug endpoint to check OAuth configuration
 * GET /api/auth/google/debug
 */
export async function GET() {
  const checks = {
    googleClientId: {
      exists: !!process.env.GOOGLE_CLIENT_ID,
      length: process.env.GOOGLE_CLIENT_ID?.length || 0,
      preview: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + "..." || "missing",
    },
    googleClientSecret: {
      exists: !!process.env.GOOGLE_CLIENT_SECRET,
      length: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
    },
    googleRedirectUri: {
      exists: !!process.env.GOOGLE_REDIRECT_URI,
      value: process.env.GOOGLE_REDIRECT_URI || "missing",
    },
    sessionPassword: {
      exists: !!process.env.SESSION_PASSWORD,
      alternativeExists: !!(
        process.env.SESSION_SECRET || process.env.IRON_SESSION_PASSWORD
      ),
    },
    authSecret: {
      exists: !!process.env.AUTH_SECRET,
      length: process.env.AUTH_SECRET?.length || 0,
    },
  };

  const allValid =
    checks.googleClientId.exists &&
    checks.googleClientSecret.exists &&
    checks.googleRedirectUri.exists &&
    (checks.sessionPassword.exists || checks.sessionPassword.alternativeExists) &&
    checks.authSecret.exists;

  return NextResponse.json({
    status: allValid ? "OK" : "ERROR",
    checks,
    errors: [
      !checks.googleClientId.exists && "GOOGLE_CLIENT_ID missing",
      !checks.googleClientSecret.exists && "GOOGLE_CLIENT_SECRET missing",
      !checks.googleRedirectUri.exists && "GOOGLE_REDIRECT_URI missing",
      !checks.sessionPassword.exists &&
        !checks.sessionPassword.alternativeExists &&
        "SESSION_PASSWORD (or SESSION_SECRET/IRON_SESSION_PASSWORD) missing",
      !checks.authSecret.exists && "AUTH_SECRET missing",
    ].filter(Boolean),
  });
}
