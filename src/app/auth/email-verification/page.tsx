export const dynamic = "force-dynamic";

import { Metadata } from "next";
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import EmailVerificationSkeleton from "./EmailVerificationSkeleton";

export const metadata: Metadata = {
  title: "BeautyWell | Email Verification",
};

const EmailVerificationClient = dynamicImport(
  () => import("./EmailVerificationClient"),
  {
    ssr: false,
  }
);

export default function EmailVerificationPage() {
  return (
    <SuspenseWrapper fallback={<EmailVerificationSkeleton />}>
      <EmailVerificationClient />
    </SuspenseWrapper>
  );
}
