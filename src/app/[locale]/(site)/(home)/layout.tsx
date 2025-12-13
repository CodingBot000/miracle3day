import { Suspense } from "react";
import dynamic from "next/dynamic";
import MainContent from "@/components/layout/MainContent";
import MenuMobile from "@/components/organism/layout/MenuMobile";

const LayoutHeaderHome = dynamic(() => import("@/components/organism/layout/header/LayoutHeaderHome"), {
  ssr: false,
});

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div>Loading header...</div>}>
        <LayoutHeaderHome />
      </Suspense>

      <main className="flex-1 w-full relative">
        <MainContent>
          {children}
        </MainContent>
      </main>

      <MenuMobile />
    </>
  );
}
