export const dynamic = "force-dynamic";

import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";

const LoginClient = dynamicImport(() => import("./LoginClient"), {
  ssr: false,
});

export default function SignUpPage() {
  return (
    <SuspenseWrapper>
      <LoginClient />
    </SuspenseWrapper>
  );
}
