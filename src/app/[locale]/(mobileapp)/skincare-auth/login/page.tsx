'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import { usePlatform } from '@/hooks/usePlatform';

export default function SkincareLoginPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { navigate } = useNavigation();
  const { isAndroidWebView } = usePlatform();
  const [isLoading, setIsLoading] = useState(false);

  // Android WebView용 Google 토큰 콜백 등록
  useEffect(() => {
    if (!isAndroidWebView) return;

    // Google 로그인 성공 시 호출되는 콜백
    (window as any).onGoogleToken = async (idToken: string) => {
      console.log('[DEBUG] onGoogleToken called, sending to server...');
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/google/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, redirectUrl: '/' }),
          credentials: 'include',
        });
        const data = await res.json();
        console.log('[DEBUG] Token API response:', data);

        if (data.success) {
          await checkOnboardingAndRedirect();
        } else {
          console.error('[DEBUG] Login failed:', data.error);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[DEBUG] Token exchange error:', error);
        setIsLoading(false);
      }
    };

    // Google 로그인 실패 시 호출되는 콜백
    (window as any).onGoogleError = (errorMessage: string) => {
      console.error('[DEBUG] Google login error:', errorMessage);
      setIsLoading(false);
    };

    return () => {
      delete (window as any).onGoogleToken;
      delete (window as any).onGoogleError;
    };
  }, [isAndroidWebView]);

  // 온보딩 체크 후 리다이렉트
  const checkOnboardingAndRedirect = async () => {
    console.log('[DEBUG] Checking onboarding status...');

    try {
      const response = await fetch('/api/skincare/onboarding/check');
      const result = await response.json();

      if (result.hasOnboarding) {
        // 온보딩 완료 -> 환영 화면
        console.log('[DEBUG] Has onboarding, show welcome');
        navigate('/skincare-auth/welcome', { replace: true });
      } else {
        // 온보딩 미완료 -> 온보딩 시작
        console.log('[DEBUG] No onboarding, start onboarding');
        navigate('/skincare-onboarding', { replace: true });
      }
    } catch (error) {
      console.error('[DEBUG] Onboarding check error:', error);
      // 에러 시 온보딩으로 이동
      navigate('/skincare-onboarding', { replace: true });
    }
  };

  const handleGoogleLogin = () => {
    // Android WebView에서는 네이티브 Google Sign-In 사용
    if (isAndroidWebView && (window as any).AndroidBridge?.requestGoogleLogin) {
      console.log('[DEBUG] Android WebView: requesting native Google login');
      setIsLoading(true);
      (window as any).AndroidBridge.requestGoogleLogin();
      return;
    }

    // 일반 브라우저는 팝업 윈도우로 OAuth 실행
    const oauthUrl = `/api/auth/google/start?state=${encodeURIComponent('/')}`;
    console.log('[DEBUG] Browser: opening OAuth in popup window:', oauthUrl);

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
      console.warn('[DEBUG] Popup blocked, falling back to redirect');
      window.location.replace(oauthUrl);
      return;
    }

    // 팝업 완료 감지
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        // 팝업이 닫혔으면 온보딩 체크 후 리다이렉트
        console.log('[DEBUG] Popup closed, checking onboarding...');
        checkOnboardingAndRedirect();
      }
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-md">
        {/* 로고/타이틀 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {locale === 'ko' ? '    ' : '    '}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {locale === 'ko' ? 'Mimotok 계정으로 로그인' : 'Sign in with Mimotok'}
          </h1>
          <p className="text-gray-600">
            {locale === 'ko'
              ? '혹은 신규가입 해주세요'
              : 'Or create a new account'}
          </p>
        </div>

        {/* Google 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="
            w-full flex items-center justify-center gap-3
            bg-white border border-gray-300 rounded-xl
            px-6 py-4 text-gray-700 font-medium
            hover:bg-gray-50 active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all shadow-sm
          "
        >
          {/* Google 아이콘 */}
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>
            {isLoading
              ? (locale === 'ko' ? '로그인 중...' : 'Signing in...')
              : (locale === 'ko' ? 'Google 계정으로 계속하기' : 'Continue with Google')
            }
          </span>
        </button>

        {/* 안내 문구 */}
        <p className="text-center text-xs text-gray-500 mt-6">
          {locale === 'ko'
            ? '로그인하면 맞춤형 스킨케어 루틴을 받을 수 있어요'
            : 'Sign in to get your personalized skincare routine'}
        </p>
      </div>
    </div>
  );
}
