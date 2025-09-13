
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import EventSkeleton from "./EventSkeleton";

const ReservationCalendarClient = dynamicImport(() => import("./ReservationCalendarClient"), {
  ssr: false,
});

export default function ReservationWrapper({ id }: { id: string }) {
  return (
    <SuspenseWrapper fallback={<EventSkeleton />}>
      <ReservationCalendarClient id={id} />
    </SuspenseWrapper>
  );
}
