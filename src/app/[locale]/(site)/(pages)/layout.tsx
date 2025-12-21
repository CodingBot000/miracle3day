import LayoutHeaderNormal from "@/components/organism/layout/header/LayoutHeaderNormal";
import MenuMobile from "@/components/organism/layout/MenuMobile";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LayoutHeaderNormal />

      <main className="w-full relative pt-[68px]">
        {/* <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8"> */}
        <div className="mx-auto w-full">
          {children}
        </div>
      </main>

      <MenuMobile />
    </>
  );
}
