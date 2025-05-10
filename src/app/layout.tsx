import "../styles/globals.scss";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/provider";
import { Footer } from "@/components/organism/layout/footer";
import { LayoutHeader } from "@/components/organism/layout/header";
import ScrollTop from "@/components/atoms/ScrollTop";
import LoadingSpinner from "@/components/atoms/loading/spinner";
import MobileMenu from "@/components/organism/layout/mobile-menu";
import { ProgressBar } from "@/components/atoms/loading/progress-bar";
import { PageTransitionOverlay } from "@/components/atoms/loading/page-transition-overlay";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProgressBar />
        {/* <PageTransitionOverlay /> */}
        <div className="bg-[rgb(247,248,250)]">
          <Providers>
            <ScrollTop />  
            <div id="modal-root" />
            <LayoutHeader />
            <main className="pt-4">
              {children}
            </main>
            <Footer />
            <MobileMenu />
            {/* <LoadingSpinner/> */}
          </Providers>
        </div>
      </body>
    </html>
  );
}
