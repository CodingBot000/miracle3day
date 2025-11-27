import { log } from '@/utils/logger';

import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import EventSkeleton from "./EventSkeleton";

const ReviewClient = dynamicImport(() => import("./ReviewClient"), {
  ssr: false,
});

export default function ReviewWrapper({ id }: { id: string }) {
    log.debug("ReviewWrapper ReviewWrapper id (id_uuid_hospital):", id);
  return (
    <SuspenseWrapper fallback={<EventSkeleton />}>
      <ReviewClient id={id} />
    </SuspenseWrapper>
  );
}
