'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { usePlatform } from '@/hooks/usePlatform';

const COOKIE_NAME = 'cookie_consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const { language } = useCookieLanguage();
  const { isWebView, isClient } = usePlatform();
  const locale = language === 'ko' ? 'ko' : 'en';

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
          이 웹사이트는 서비스 제공과 사용자 경험 향상을 위해 쿠키를 사용합니다. <br />
          필수 쿠키는 항상 활성화되며, 분석 및 마케팅 쿠키는 귀하의 동의가 필요합니다. <br />
          계속 이용 시 쿠키 사용에 동의하는 것으로 간주됩니다. <br />
          자세한 내용은{' '}
          <Link
            href="/cookie-policy"
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
          This website uses cookies to provide essential functionality and enhance your experience. <br />
          Essential cookies are always active, while analytics and marketing cookies require your consent. <br />
          By continuing to use the site, you agree to our cookie usage. <br />
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

  return (
    <div
      className="fixed bottom-20 right-6 z-50 max-w-sm w-[90%] sm:w-80 bg-white border border-gray-200 shadow-lg rounded-xl p-4 text-sm text-gray-800 animate-fadeIn"
      role="dialog"
      aria-live="polite"
    >
      <div className="mb-3 leading-relaxed">{text[locale].message}</div>

      <div className="flex flex-wrap gap-2 justify-end">
        <button
          onClick={rejectCookies}
          className="px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          aria-label={text[locale].reject}
        >
          {text[locale].reject}
        </button>
        <button
          onClick={acceptAllCookies}
          className="px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          aria-label={text[locale].accept}
        >
          {text[locale].accept}
        </button>
      </div>
    </div>
  );
}
