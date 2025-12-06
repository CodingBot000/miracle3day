// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import { Inter } from 'next/font/google';
import Providers from '@/provider';
import ScrollTop from '@/components/atoms/ScrollTop';
import { ProgressBar } from '@/components/atoms/loading/ProgressBar';
import CookieConsent from '@/components/template/CookieConsent';
import { Toaster } from 'sonner';
import { HeaderProvider } from '@/contexts/HeaderContext';
import Script from 'next/script';
import GA4Scripts from '@/components/common/GA4Scripts';
import GA4PageViewTracker from '@/components/common/GA4PageView';

const inter = Inter({ subsets: ['latin'] });

// 동적 메타데이터 - locale별로 다르게
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    metadataBase: new URL('https://mimotok.com'),
    title: {
      default: t('title'),
      template: `%s | Mimotok`,
    },
    description: t('description'),
    keywords: [
      'beauty',
      'clinic',
      'korea',
      'kbeauty',
      'skincare',
      'cosmetics',
      'dermatology',
      'plastic surgery',
      'mimotok',
      'aesthetic',
      'treatment',
      'appointment',
      'review',
    ],
    authors: [{ name: 'MimoTok Team' }],
    robots: 'index, follow',
    openGraph: {
      type: 'website',
      siteName: 'MimoTok',
      title: t('title'),
      description: t('description'),
      url: `https://mimotok.com/${locale}`,
      locale: locale,
      alternateLocale: ['en', 'ko', 'ja', 'zh-CN', 'zh-TW'].filter(l => l !== locale),
      images: [
        {
          url: '/mimotok_preview.png',
          width: 1200,
          height: 630,
          alt: 'MimoTok preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/mimotok_preview.png'],
    },
    alternates: {
      canonical: `https://mimotok.com/${locale}`,
      languages: {
        en: 'https://mimotok.com/en',
        ko: 'https://mimotok.com/ko',
        ja: 'https://mimotok.com/ja',
        'zh-CN': 'https://mimotok.com/zh-CN',
        'zh-TW': 'https://mimotok.com/zh-TW',
      },
    },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// 정적 params 생성 (빌드 시 각 locale 페이지 생성)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 유효하지 않은 locale이면 404
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // 번역 메시지 로드
  const messages = await getMessages();

  return (
    <html lang={locale} className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <Script id="runtime-env" strategy="beforeInteractive">
          {`(function(){function d(){if(window.APP_ENV?.inWebView){return{inWebView:true,platform:window.APP_ENV.platform}}const u=navigator.userAgent;if(u.includes('MyAppWebView/1.0 (Android)'))return{inWebView:true,platform:'android'};if(u.includes('MyAppWebView/1.0 (iOS)'))return{inWebView:true,platform:'ios'};return{inWebView:false,platform:/Android/i.test(u)?'android':/iPhone|iPad|iPod/i.test(u)?'ios':'web'}}window.RUNTIME_ENV=d();document.documentElement.dataset.inWebview=String(window.RUNTIME_ENV.inWebView);document.documentElement.dataset.platform=window.RUNTIME_ENV.platform;})();`}
        </Script>
        <Script id="android-google-login" strategy="beforeInteractive">
          {`
            window.onGoogleToken = async function(idToken) {
              try {
                const res = await fetch('/api/auth/google/token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idToken, redirectUrl: window.location.pathname })
                });
                const data = await res.json();
                if (data.success) {
                  window.location.href = data.redirectUrl || '/';
                } else {
                  console.error('Google login failed:', data.error);
                  if (window.AndroidBridge?.onLoginError) {
                    window.AndroidBridge.onLoginError(data.error || 'Login failed');
                  }
                }
              } catch (error) {
                console.error('Google token verification error:', error);
                if (window.AndroidBridge?.onLoginError) {
                  window.AndroidBridge.onLoginError(error.message || 'Network error');
                }
              }
            };
          `}
        </Script>
      </head>
      <body className={inter.className + ' min-h-screen flex flex-col overflow-x-hidden'}>
        {/* GA4 스크립트 삽입 */}
        <GA4Scripts />
        {/* 라우트 변경 시 page_view 전송 */}
        <GA4PageViewTracker />

        <ProgressBar />

        <NextIntlClientProvider messages={messages}>
          <Providers>
            <HeaderProvider>
              <ScrollTop />
              <div id="modal-root" />

              {children}

              <CookieConsent />
              <Toaster richColors position="top-center" duration={1500} />
            </HeaderProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
