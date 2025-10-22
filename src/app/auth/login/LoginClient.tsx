"use client";

import { useSignIn } from "@clerk/nextjs";

export default function LoginClient() {
  const { signIn, isLoaded } = useSignIn();

  const handleGoogleLogin = async () => {
    await signIn?.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/auth/continue",
      redirectUrlComplete: "/",
    });
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur">
      <h1 className="text-2xl font-semibold text-center text-slate-900">
        Sign in to continue
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        Use your Google account to explore clinics and book treatments.
      </p>
      <button
        type="button"
        disabled={!isLoaded}
        onClick={handleGoogleLogin}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        Continue with Google
      </button>
    </div>
  );
}
