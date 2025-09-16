export const dynamic = "force-dynamic";

import { Metadata } from "next";
import dynamicImport from "next/dynamic";
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import ForgetPasswordSkeleton from "./ForgetPasswordSkeleton";

export const metadata: Metadata = {
  title: "BeautyWell | Forget Password",
};

const ForgetPasswordClient = dynamicImport(() => import("./ForgetPasswordClient"), {
  ssr: false,
});

export default function ForgetPasswordPage() {
  return (
    <SuspenseWrapper fallback={<ForgetPasswordSkeleton />}>
      <ForgetPasswordClient />
    </SuspenseWrapper>
  );
}
