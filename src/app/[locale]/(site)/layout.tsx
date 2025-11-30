import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Footer } from "@/components/organism/layout/Footer";
import MainContent from "@/components/layout/MainContent";
import MenuMobile from "@/components/organism/layout/MenuMobile";

const LayoutHeader = dynamic(() => import("@/components/organism/layout/LayoutHeader"), {
  ssr: false,
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0] flex flex-col flex-1 w-full overflow-x-clip">
      <Suspense fallback={<div>Loading header...</div>}>
        <LayoutHeader />
      </Suspense>

      {/* 메인: 헤더 고정으로 인한 여백 */}
      <main className="flex-1 w-full relative">
        {/* HeroVideo는 이 안에서 full-width로 표시되고,
            나머지 컨텐츠는 max-w-[1200px] 제한 */}
        <MainContent>
          {children}
        </MainContent>
      </main>

      <MenuMobile />
      <Footer />
    </div>
  );
}
