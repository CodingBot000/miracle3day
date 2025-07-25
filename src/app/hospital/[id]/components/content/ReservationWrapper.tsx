
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import EventSkeleton from "./EventSkeleton";

const ReservationClient = dynamicImport(() => import("./ReservationClient"), {
  ssr: false,
});

export default function ReservationWrapper({ id }: { id: string }) {
  return (
    <SuspenseWrapper fallback={<EventSkeleton />}>
      <ReservationClient id={id} />
    </SuspenseWrapper>
  );
}
