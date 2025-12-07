export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ClinicInfoUploadClientWrapper from "./ClinicInfoUploadClientWrapper";
import UploadSkeleton from "./UploadSkeleton";

export default function ClinicInfoUploadClientPageWrapper() {
  return (
    <Suspense fallback={<UploadSkeleton />}>
      <ClinicInfoUploadClientWrapper />
    </Suspense>
  );
}
