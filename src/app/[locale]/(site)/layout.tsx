import { Footer } from "@/components/organism/layout/Footer";
import { AppBridgeProvider } from "@/components/providers/AppBridgeProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppBridgeProvider>
      <div className="bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0] flex flex-col flex-1 w-full overflow-x-clip">
        {children}
        <Footer />
      </div>
    </AppBridgeProvider>
  );
}
