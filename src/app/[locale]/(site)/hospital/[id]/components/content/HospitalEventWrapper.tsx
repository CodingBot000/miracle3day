
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import EventSkeleton from "./EventSkeleton";

const HospitalEventClient = dynamicImport(() => import("./HospitalEventClient"), {
  ssr: false,
});

export default function HospitalEventWrapper({ id }: { id: string }) {
  return (
    <SuspenseWrapper fallback={<EventSkeleton />}>
      <HospitalEventClient id={id} />
    </SuspenseWrapper>
  );
}
