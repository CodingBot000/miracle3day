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
// import { ProgressBar } from "@/components/atoms/loading/progress-bar";
// import { PageTransitionOverlay } from "@/components/atoms/loading/page-transition-overlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://miracle3day.vercel.app"),
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full overflow-x-hidden"> {/* 가로 스크롤 차단(보조) */}
      <body className={inter.className + " min-h-screen flex flex-col overflow-x-hidden"}>
        <ProgressBar />
        {/* <PageTransitionOverlay /> */}

        {/* 배경/루트 래퍼: 변형/음수마진으로 넘칠 때를 대비해 clip */}
        <div className="bg-gradient-hero flex flex-col flex-1 min-h-screen w-full overflow-x-clip">
          <Providers>
            <ScrollTop />
            <div id="modal-root" />

            <Suspense fallback={<div>Loading header...</div>}>
              <LayoutHeader />
            </Suspense>

            {/* 메인은 항상 뷰포트폭에 맞춤 */}
            <main className="pt-4 flex-1 pb-[72px] w-full">
              {/* 컨텐츠 컨테이너: 데스크탑 1200px 제한 + 모바일 꽉 채우기 */}
              <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 min-w-0">
                {children}
              </div>
            </main>

            <CookieConsent />
            {/* <MenuMobile /> */}
            <Footer />
            <Toaster richColors position="top-center" duration={1500}/>
          </Providers>
        </div>
      </body>
    </html>
  );
}

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" className="h-full">
//       <body className={inter.className + " min-h-screen flex flex-col"}>
//         <ProgressBar />
//         {/* <PageTransitionOverlay /> */}
//         {/* <div className="bg-background flex flex-col flex-1 min-h-screen"> */}
//         <div className="bg-gradient-hero flex flex-col flex-1 min-h-screen">
//           <Providers>
//             <ScrollTop />  
//             <div id="modal-root" />
//             <Suspense fallback={<div>Loading header...</div>}>
//               <LayoutHeader />
//             </Suspense>
//             <main className="pt-4 flex-1 pb-[72px]"> {/* 72px은 모바일 메뉴바의 높이 */}
//               <div className="max-w-[1200px] mx-auto px-4">
//                 {children}
//               </div>
//             </main>
//             <CookieConsent />
//             <MenuMobile />
//             <Footer />
           
//           </Providers> 
//         </div>
//       </body>
//     </html>
//   );
// }