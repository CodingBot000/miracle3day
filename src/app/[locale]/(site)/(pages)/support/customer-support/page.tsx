export const dynamic = "force-dynamic";

import { Metadata } from "next";
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";


export const metadata: Metadata = {
  title: "BeautyWell | CustomerSupport",
};

const CustomerSupportClient = dynamicImport(() => import("./CustomerSupportClient"), {
  ssr: false,
});
export default function CustomerSupportPage() {
  return (
    <SuspenseWrapper>
      <CustomerSupportClient />
    </SuspenseWrapper>
  );
}
