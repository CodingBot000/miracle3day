// export const dynamic = "force-dynamic";

// const AllEventPage = () => {
//   return null;
// };

// export default AllEventPage;
export const dynamic = "force-dynamic";

import PageHeader from "@/components/molecules/PageHeader";
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import EventSkeleton from "./EventSkeleton";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BeautyLink | Event",
};

const EventClient = dynamicImport(() => import("./EventList"), {
  ssr: false,
});



const AllEventPage = () => {
  return (
    <>
      <PageHeader name="All Event" />
      <SuspenseWrapper fallback={<EventSkeleton />}>
        <EventClient />
      </SuspenseWrapper>
    </>
  );
};

export default AllEventPage;
