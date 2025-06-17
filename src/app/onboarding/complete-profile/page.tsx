export const dynamic = "force-dynamic";

import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";


const SignUpMoreInfoForm = dynamicImport(() => import("./SignUpMoreInfoForm"), {
  ssr: false,
});

// export default function SignUpMoreInfoFormPage({ onSubmit }: { onSubmit: (data: any) => void }) {
  export default function SignUpMoreInfoFormPage() {
  return (
    <SuspenseWrapper>
      <SignUpMoreInfoForm />
    </SuspenseWrapper>
  );
}
