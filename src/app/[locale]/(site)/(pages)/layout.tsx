import LayoutHeaderNormal from "@/components/organism/layout/LayoutHeaderNormal";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LayoutHeaderNormal />

      <main className="flex-1 w-full relative pt-[88px]">
        {children}
      </main>
    </>
  );
}
