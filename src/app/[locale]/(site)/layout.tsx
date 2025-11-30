import { Footer } from "@/components/organism/layout/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0] flex flex-col flex-1 w-full overflow-x-clip">
      {children}
      <Footer />
    </div>
  );
}
