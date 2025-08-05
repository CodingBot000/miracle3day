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
// import { ProgressBar } from "@/components/atoms/loading/progress-bar";
// import { PageTransitionOverlay } from "@/components/atoms/loading/page-transition-overlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beauty Main - Your Beauty Journey",
  description: "Find the best beauty clinics and treatments in Korea. Book appointments, read reviews, and get expert advice.",
  keywords: "beauty, clinic, korea, aesthetic, treatment, appointment, review",
  authors: [{ name: "Beauty Main Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Beauty Main - Your Beauty Journey",
    description: "Find the best beauty clinics and treatments in Korea. Book appointments, read reviews, and get expert advice.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_US", "ja_JP", "zh_CN"],
    siteName: "Beauty Main",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beauty Main - Your Beauty Journey",
    description: "Find the best beauty clinics and treatments in Korea. Book appointments, read reviews, and get expert advice.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};


const LayoutHeader = dynamic(() => import("@/components/organism/layout/LayoutHeader"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={inter.className + " min-h-screen flex flex-col"}>
        <ProgressBar />
        {/* <PageTransitionOverlay /> */}
        {/* <div className="bg-background flex flex-col flex-1 min-h-screen"> */}
        <div className="bg-gradient-hero flex flex-col flex-1 min-h-screen">
          <Providers>
            <ScrollTop />  
            <div id="modal-root" />
            <Suspense fallback={<div>Loading header...</div>}>
              <LayoutHeader />
            </Suspense>
            <main className="pt-4 flex-1 pb-[72px]"> {/* 72px은 모바일 메뉴바의 높이 */}
              {children}
              
            </main>
            <CookieConsent />
            <MenuMobile />
            <Footer />
           
          </Providers> 
        </div>
      </body>
    </html>
  );
}