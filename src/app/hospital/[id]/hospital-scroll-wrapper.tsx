'use client';

import { useRef } from "react";

import dynamic from "next/dynamic";
import HospitalTab from "./components/tab";
import { HospitalDetailMainOutput } from "@/app/api/hospital/[id]/main/main.dto";

const InfoTab = dynamic(() => import("./components/tab/info"));
const EventTab = dynamic(() => import("./components/tab/event"));
const ReviewTab = dynamic(() => import("./components/tab/review"));

interface InfoTabProps {
    hospitalData: HospitalDetailMainOutput;
}

export default function HospitalScrollWrapper({ hospitalData } : InfoTabProps) {
  const tabRefs = {
    event: useRef<HTMLDivElement>(null),
    review: useRef<HTMLDivElement>(null),
    info: useRef<HTMLDivElement>(null),
  };

  return (
    <>
        {/* /* PageHeader의 실제 높이 : min-height: 55px padding: 12px 24px (상하 12px) */ }
        <div className="sticky top-[4.9375rem] z-[11] bg-white">
          <HospitalTab tabRefs={tabRefs} />
        </div>
        <div ref={tabRefs.event}><EventTab /></div>
        <div ref={tabRefs.review}><ReviewTab /></div>
        <div ref={tabRefs.info}><InfoTab hospitalData={hospitalData} /></div>
    </>
  );
}
