import { Footer } from "@/components/organism/layout/Footer";
import { AppBridgeProvider } from "@/components/providers/AppBridgeProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppBridgeProvider>
      <div className="bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0] flex flex-col flex-1 w-full overflow-x-clip">
        <div className="w-full max-w-[1024px] mx-auto flex flex-col flex-1">
          {children}
          <Footer />
        </div>
      </div>
    </AppBridgeProvider>
  );
}
