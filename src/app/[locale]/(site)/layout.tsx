import { Footer } from "@/components/organism/layout/Footer";
import { AppBridgeProvider } from "@/components/providers/AppBridgeProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppBridgeProvider>
      <div className="bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0]">
        <div className="w-full max-w-[1024px] mx-auto">
          {children}
          <Footer />
        </div>
      </div>
    </AppBridgeProvider>
  );
}
