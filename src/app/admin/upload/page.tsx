export const dynamic = "force-dynamic";

import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import UploadSkeleton from "./UploadSkeleton";

const UploadClient = dynamicImport(() => import("./UploadClient"), {
  ssr: false,
});

export default function UploadPageWrapper() {
  return (
    <SuspenseWrapper fallback={<UploadSkeleton />}>
      <UploadClient />
    </SuspenseWrapper>
  );
}
