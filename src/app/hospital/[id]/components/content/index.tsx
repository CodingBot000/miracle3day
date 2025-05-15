'use client';

import { useRef } from "react";

import dynamic from "next/dynamic";
import HospitalTab from "../tab";
import { HospitalDetailMainOutput } from "@/app/api/hospital/[id]/main/main.dto";

const InfoTab = dynamic(() => import("./info"));
// const EventTab = dynamic(() => import("./event"));
const EventTab = dynamic(() => import("./HospitalEventWrapper"));
const ReviewTab = dynamic(() => import("./review"));

interface InfoTabProps {
    hospitalId: string;
    hospitalData: HospitalDetailMainOutput;
}

export default function HospitalDetailContent({ hospitalId, hospitalData } : InfoTabProps) {
  const tabRefs = {
    event: useRef<HTMLDivElement>(null),
    review: useRef<HTMLDivElement>(null),
    info: useRef<HTMLDivElement>(null),
  };
  // console.log("HospitalDetailContent hospitalId:", hospitalId);
  return (
    <>
        {/* /* PageHeader의 실제 높이 : min-height: 55px padding: 12px 24px (상하 12px) */ }
        <div className="sticky top-[4.9375rem] z-[11] bg-white">
          <HospitalTab tabRefs={tabRefs} />
        </div>
        <div className="mt-12" ref={tabRefs.event}><EventTab id={hospitalId} /></div>
        <div className="mt-12" ref={tabRefs.review}><ReviewTab id={hospitalId} /></div>
        <div className="mt-12" ref={tabRefs.info}><InfoTab hospitalData={hospitalData} /></div>
    </>
  );
}
