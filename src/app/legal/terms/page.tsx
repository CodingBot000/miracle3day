export const dynamic = "force-dynamic";

import { Metadata } from "next";
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";


export const metadata: Metadata = {
  title: "BeautyWell | TermsPage",
};

const TermsClient = dynamicImport(() => import("./TermsClient"), {
  ssr: false,
});

export default function TermsPage() {
  return (
    <SuspenseWrapper>
      <TermsClient />
    </SuspenseWrapper>
  );
}

