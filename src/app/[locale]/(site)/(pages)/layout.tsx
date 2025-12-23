import LayoutHeaderNormal from "@/components/organism/layout/header/LayoutHeaderNormal";
import MenuMobile from "@/components/organism/layout/MenuMobile";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LayoutHeaderNormal />

      <main className="w-full relative pt-[68px] overflow-x-hidden min-h-screen">
        <div className="mx-auto w-full max-w-full">
          {children}
        </div>
      </main>

      <MenuMobile />
    </>
  );
}
