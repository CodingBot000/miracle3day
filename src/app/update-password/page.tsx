export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";
import UpdatePasswordSkeleton from "./UpdatePasswordSkeleton";
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";

const UpdatePasswordClient = dynamicImport(() => import("./UpdatePasswordClient"), {
  ssr: false,
});

export default function UpdatePasswordPage() {
  return (
    <SuspenseWrapper fallback={<UpdatePasswordSkeleton />}>
      <UpdatePasswordClient />
    </SuspenseWrapper>
  );
}
