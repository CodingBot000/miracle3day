"use client";

import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function LoginClient() {
  const searchParams = useSearchParams();
  const locale = useLocale();

  // Get redirect URL from query params (default to home page)
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleGoogleLogin = () => {
    // Pass redirect URL as state parameter to OAuth flow
    const oauthUrl = `/api/auth/google/start?state=${encodeURIComponent(redirectUrl)}`;
    window.location.href = oauthUrl;
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur">
      <h1 className="text-2xl font-semibold text-center text-slate-900">
        {locale === 'ko' ? '로그인하여 계속하기' : 'Sign in to continue'}
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        {locale === 'ko' ? 'Google 계정으로 클리닉을 탐색하고 예약하세요.' : 'Use your Google account to explore clinics and book treatments.'}
      </p>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Continue with Google
      </button>
    </div>
  );
}
