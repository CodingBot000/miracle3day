"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePlatform } from '@/hooks/usePlatform';

export default function LoginClient() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { isAndroidWebView } = usePlatform();
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect URL from query params (default to home page)
  const redirectUrl = searchParams.get('redirect') || '/';

  // Android WebView용 Google 토큰 콜백 등록
  useEffect(() => {
    if (!isAndroidWebView) return;

    // Google 로그인 성공 시 호출되는 콜백
    (window as any).onGoogleToken = async (idToken: string) => {
      console.log('onGoogleToken called, sending to server...');
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/google/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, redirectUrl }),
          credentials: 'include',
        });
        const data = await res.json();
        console.log('Token API response:', data);

        if (data.success && data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          console.error('Login failed:', data.error);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Token exchange error:', error);
        setIsLoading(false);
      }
    };

    // Google 로그인 실패 시 호출되는 콜백
    (window as any).onGoogleError = (errorMessage: string) => {
      console.error('Google login error:', errorMessage);
      setIsLoading(false);
    };

    return () => {
      delete (window as any).onGoogleToken;
      delete (window as any).onGoogleError;
    };
  }, [isAndroidWebView, redirectUrl]);

  const handleGoogleLogin = () => {
    // Android WebView에서는 네이티브 Google Sign-In 사용
    if (isAndroidWebView && window.AndroidBridge?.requestGoogleLogin) {
      console.log('Android WebView: requesting native Google login');
      setIsLoading(true);
      window.AndroidBridge.requestGoogleLogin();
      return;
    }

    // 일반 브라우저는 팝업 윈도우로 OAuth 실행
    const oauthUrl = `/api/auth/google/start?state=${encodeURIComponent(redirectUrl)}`;
    console.log('Browser: opening OAuth in popup window:', oauthUrl);

    setIsLoading(true);

    // 팝업 윈도우 중앙 위치 계산
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // 팝업 윈도우 열기
    const popup = window.open(
      oauthUrl,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top},popup=1`
    );

    if (!popup) {
      // 팝업 차단된 경우 - 기존 리다이렉트 방식으로 폴백
      console.warn('Popup blocked, falling back to redirect');
      window.location.replace(oauthUrl);
      return;
    }

    // 팝업 완료 감지
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        setIsLoading(false);
        // 팝업이 닫혔으면 원래 가려던 페이지로 이동
        console.log('Popup closed, redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      }
    }, 500);
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
        disabled={isLoading}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (locale === 'ko' ? '로그인 중...' : 'Signing in...') : 'Continue with Google'}
      </button>
    </div>
  );
}
