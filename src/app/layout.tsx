import "../styles/globals.scss";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/organism/layout/footer";
import { Header } from "@/components/organism/layout/header";
import Providers from "@/provider";
import ScrollTop from "@/components/atoms/scrollTop";
import LoadingSpinner from "@/components/atoms/loading/spinner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3Days Miracle",
  description: "3Days Miracle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="bg-[rgb(247,248,250)]">
          <Providers>
            <ScrollTop />  
            <div id="modal-root" />
            <Header />
            <main className="pt-4">
              {children}
            </main>
            <Footer />
            {/* <LoadingSpinner/> */}
            
          </Providers>
        </div>
      </body>
    </html>
  );
}
