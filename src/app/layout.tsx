import "../styles/globals.scss";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/provider";
import { Footer } from "@/components/organism/layout/Footer";
// import { LayoutHeader } from "@/components/organism/layout/LayoutHeader";
import ScrollTop from "@/components/atoms/ScrollTop";
// import LoadingSpinner from "@/components/atoms/loading/spinner";
import MenuMobile from "@/components/organism/layout/MenuMobile";
import { ProgressBar } from "@/components/atoms/loading/ProgressBar";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import CookieConsent from "@/components/template/CookieConsent";
import { Toaster } from "sonner";
import { HeaderProvider } from "@/contexts/HeaderContext";
import MainContent from "@/components/layout/MainContent";
import Script from "next/script";
import { headers } from "next/headers";

// import { ProgressBar } from "@/components/atoms/loading/progress-bar";
// import { PageTransitionOverlay } from "@/components/atoms/loading/page-transition-overlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://mimotok.cloud"),
title: "MimoTok - Your Beauty Journey",
  description:
    "Find the best beauty clinics and treatments in Korea. Book appointments, read reviews, and get expert advice.",
  keywords: [
    "beauty",
    "clinic",
    "korea",
    "mimotok",
    "aesthetic",
    "treatment",
    "appointment",
    "review",
  ],
  authors: [{ name: "MimoTok Team" }],
  robots: "index, follow",
  alternates: {
    canonical: "/", // 필요 시 언어별 canonical 매핑 가능
    languages: {
      "en-US": "/",
      "ja-JP": "/ja",
      "zh-CN": "/zh",
    },
  },
  openGraph: {
    type: "website",
    siteName: "MimoTok",
    title: "MimoTok - Your Beauty Journey",
    description:
      "Find the best beauty clinics and treatments in Korea. Book appointments, read reviews, and get expert advice.",
    url: "/", // 이 페이지의 정규 URL
    locale: "en_US",
    alternateLocale: ["ja_JP", "zh_CN"],
    images: [
      {
        url: "/mimotok_preview.png", // public/mimotok_preview.png (1200x630)
        width: 1200,
        height: 630,
        alt: "MimoTok preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MimoTok - Your Beauty Journey",
    description:
      "Find the best beauty clinics and treatments in Korea. Book appointments, read reviews, and get expert advice.",
    images: ["/mimotok_preview.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};


const LayoutHeader = dynamic(() => import("@/components/organism/layout/LayoutHeader"), {
  ssr: false,
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 서버 사이드에서 pathname 확인
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAuthPage = pathname.startsWith('/auth/login');

  return (
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
        <head>
        <Script id="runtime-env" strategy="beforeInteractive">
{`(function(){function d(){if(window.APP_ENV?.inWebView){return{inWebView:true,platform:window.APP_ENV.platform}}const u=navigator.userAgent;if(u.includes('MyAppWebView/1.0 (Android)'))return{inWebView:true,platform:'android'};if(u.includes('MyAppWebView/1.0 (iOS)'))return{inWebView:true,platform:'ios'};return{inWebView:false,platform:/Android/i.test(u)?'android':/iPhone|iPad|iPod/i.test(u)?'ios':'web'}}window.RUNTIME_ENV=d();document.documentElement.dataset.inWebview=String(window.RUNTIME_ENV.inWebView);document.documentElement.dataset.platform=window.RUNTIME_ENV.platform;})();`}
        </Script>
        </head>
        <body className={inter.className + " min-h-screen flex flex-col overflow-x-hidden"}>
          <ProgressBar />
          {/* <PageTransitionOverlay /> */}

          <Providers>
            <HeaderProvider>
              <ScrollTop />
              <div id="modal-root" />

              {!isAuthPage && (
                <Suspense fallback={<div>Loading header...</div>}>
                  <LayoutHeader />
                </Suspense>
              )}

              {/* 배경/루트 래퍼: 변형/음수마진으로 넘칠 때를 대비해 clip */}
              <div className="bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0] flex flex-col min-h-screen w-full overflow-x-clip">
                {/* 메인: 헤더 고정으로 인한 여백 없음 */}
                <main className={`flex-grow w-full relative ${!isAuthPage ? 'pb-[72px]' : ''}`}>
                  {/* HeroVideo는 이 안에서 full-width로 표시되고,
                      나머지 컨텐츠는 max-w-[1200px] 제한 */}
                  {isAuthPage ? (
                    children
                  ) : (
                    <MainContent>
                      {children}
                    </MainContent>
                  )}
                </main>

                <CookieConsent />
                {!isAuthPage && <MenuMobile />}
                {!isAuthPage && <Footer />}
                <Toaster richColors position="top-center" duration={1500}/>
              </div>
            </HeaderProvider>
          </Providers>
        </body>
      </html>
  );
}
