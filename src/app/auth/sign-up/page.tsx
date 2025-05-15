export const dynamic = "force-dynamic";

import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import SignUpSkeleton from "./SignUpSkeleton";

const SignUpClient = dynamicImport(() => import("./SignUpClient"), {
  ssr: false,
});

export default function SignUpPage() {
  return (
    <SuspenseWrapper fallback={<SignUpSkeleton />}>
      <SignUpClient />
    </SuspenseWrapper>
  );
}
