'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { usePlatform } from '@/hooks/usePlatform';

const COOKIE_NAME = 'cookie_consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [locale, setLocale] = useState<string>('en');
  const { isWebView, isClient } = usePlatform();

  // 클라이언트에서 locale 감지
  useEffect(() => {
    const pathLocale = window.location.pathname.split('/')[1];
    if (['ko', 'en', 'ja', 'zh-CN', 'zh-TW'].includes(pathLocale)) {
      setLocale(pathLocale);
    }
  }, []);

  useEffect(() => {
    // 플랫폼 감지가 완료될 때까지 대기
    if (!isClient) return;

    // 웹뷰(앱)에서는 쿠키 동의 배너를 표시하지 않음
    if (isWebView) {
      setShow(false);
      return;
    }

    const consent = Cookies.get(COOKIE_NAME);
    if (!consent) setShow(true);
  }, [isWebView, isClient]);

  const acceptAllCookies = () => {
    Cookies.set(COOKIE_NAME, 'accepted', {
      expires: 365,
      path: '/',
    });
    setShow(false);
  };

  const rejectCookies = () => {
    Cookies.set(COOKIE_NAME, 'rejected', {
      expires: 365,
      path: '/',
    });
    setShow(false);
  };

  if (!show) return null;

  const text = {
    ko: {
      message: (
        <>
          이 웹사이트는 서비스 제공과 사용자 경험 향상을 위해 쿠키를 사용합니다. 
          필수 쿠키는 항상 활성화되며, 분석 및 마케팅 쿠키는 귀하의 동의가 필요합니다. 
          계속 이용 시 쿠키 사용에 동의하는 것으로 간주됩니다. 
          자세한 내용은{' '}
          <Link
            href="/legal/cookie-policy"
            className="text-blue-600 underline hover:text-blue-800"
          >
            쿠키 정책
          </Link>
          을 참고하세요.
        </>
      ),
      accept: '모두 허용',
      reject: '필수 쿠키만 허용',
    },
    en: {
      message: (
        <>
          This website uses cookies to provide essential functionality and enhance your experience. 
          Essential cookies are always active, while analytics and marketing cookies require your consent. 
          By continuing to use the site, you agree to our cookie usage. 
          For more details, see our{' '}
          <Link
            href="/legal/cookie-policy"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Cookie Policy
          </Link>
          .
        </>
      ),
      accept: 'Accept all',
      reject: 'Use only essential cookies',
    },
  };

  const currentLocale = locale === 'ko' ? 'ko' : 'en';

  return (
    <div
      className="fixed bottom-20 left-4 right-6 sm:left-auto sm:right-10 z-50 sm:max-w-sm bg-white border border-gray-200 shadow-lg rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-gray-800 animate-fadeIn"
      role="dialog"
      aria-live="polite"
    >
      <div className="mb-2 sm:mb-3 leading-relaxed text-xs sm:text-sm">{text[currentLocale].message}</div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-end">
        <button
          onClick={rejectCookies}
          className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          aria-label={text[currentLocale].reject}
        >
          {text[currentLocale].reject}
        </button>
        <button
          onClick={acceptAllCookies}
          className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          aria-label={text[currentLocale].accept}
        >
          {text[currentLocale].accept}
        </button>
      </div>
    </div>
  );
}
