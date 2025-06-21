'use client';

import { useRef } from "react";

import dynamic from "next/dynamic";
import HospitalDetailPageTab from "../tab/HospitalDetailPageTab";
import { HospitalDetailMainOutput } from "@/app/api/hospital/[id]/main/main.dto";

const InfoTab = dynamic(() => import("./info"));
// const EventTab = dynamic(() => import("./event"));
const EventTab = dynamic(() => import("./HospitalEventWrapper"));
const ReviewTab = dynamic(() => import("./ReviewWrapper"));

interface DetailPageTabProps {
    hospitalData: HospitalDetailMainOutput;
}

export default function HospitalDetailContent({ hospitalData } : DetailPageTabProps) {
  const tabRefs = {
    event: useRef<HTMLDivElement>(null),
    review: useRef<HTMLDivElement>(null),
    info: useRef<HTMLDivElement>(null),
  };
  const id_uuid_hospital = hospitalData.hospital_info.id_uuid;
  console.log("HospitalDetailContent id_uuid_hospital:", id_uuid_hospital);
  // console.log("HospitalDetailContent hospitalData:", hospitalData);
  return (
    <>
        {/* /* PageHeader의 실제 높이 : min-height: 55px padding: 12px 24px (상하 12px) */ }
        <div className="sticky top-[4.9375rem] z-[11] bg-white">
          <HospitalDetailPageTab tabRefs={tabRefs} />
        </div>
        <div className="mt-12" ref={tabRefs.event}><EventTab id={id_uuid_hospital} /></div>
        <div className="mt-12" ref={tabRefs.review}><ReviewTab id={id_uuid_hospital} /></div>
        <div className="mt-12" ref={tabRefs.info}><InfoTab hospitalData={hospitalData} /></div>
    </>
  );
}
