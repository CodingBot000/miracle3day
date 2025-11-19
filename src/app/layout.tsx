import "../styles/globals.scss";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/provider";
import ScrollTop from "@/components/atoms/ScrollTop";
import { ProgressBar } from "@/components/atoms/loading/ProgressBar";
import CookieConsent from "@/components/template/CookieConsent";
import { Toaster } from "sonner";
import { HeaderProvider } from "@/contexts/HeaderContext";
import Script from "next/script";

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


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <Script id="runtime-env" strategy="beforeInteractive">
{`(function(){function d(){if(window.APP_ENV?.inWebView){return{inWebView:true,platform:window.APP_ENV.platform}}const u=navigator.userAgent;if(u.includes('MyAppWebView/1.0 (Android)'))return{inWebView:true,platform:'android'};if(u.includes('MyAppWebView/1.0 (iOS)'))return{inWebView:true,platform:'ios'};return{inWebView:false,platform:/Android/i.test(u)?'android':/iPhone|iPad|iPod/i.test(u)?'ios':'web'}}window.RUNTIME_ENV=d();document.documentElement.dataset.inWebview=String(window.RUNTIME_ENV.inWebView);document.documentElement.dataset.platform=window.RUNTIME_ENV.platform;})();`}
        </Script>
      </head>
      <body className={inter.className + " min-h-screen flex flex-col overflow-x-hidden"}>
        <ProgressBar />

        <Providers>
          <HeaderProvider>
            <ScrollTop />
            <div id="modal-root" />

            {children}

            <CookieConsent />
            <Toaster richColors position="top-center" duration={1500}/>
          </HeaderProvider>
        </Providers>
      </body>
    </html>
  );
}
