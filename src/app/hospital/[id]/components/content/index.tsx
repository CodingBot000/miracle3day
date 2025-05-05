"use client";

import { useEffect, useRef, useState } from "react";
import { tabList } from "../tab/constant";
import TabComponent from "@/components/molecules/tab";

import dynamic from "next/dynamic";
// import HospitalEvent from "./event";
// import ReviewTab from "./review";
// import InfoTab from "./info";
import { HospitalDetailMainOutput } from "@/app/api/hospital/[id]/main/main.dto";
import { HospitalDetailInfoOutDto } from "@/app/api/hospital/[id]/info/info.dto";


const InfoTab = dynamic(() => import("./info"));
const EventTab = dynamic(() => import("./event"));
const ReviewTab = dynamic(() => import("./review"));

interface HospitalTabProps {
  id: string;
  initialTab?: string;
  hospitalData: HospitalDetailMainOutput;
}

const HospitalDetailContent = ({ id, initialTab = "event", hospitalData }: HospitalTabProps) => {
  const [currentTab, setCurrentTab] = useState(initialTab);
  const tabRefs = {
    event: useRef<HTMLDivElement>(null),
    review: useRef<HTMLDivElement>(null),
    info: useRef<HTMLDivElement>(null),
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    const element = tabRefs[tab as keyof typeof tabRefs].current;
    if (element) {
      const tabMenuHeight = 60;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - tabMenuHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* <div className="sticky top-0 z-10 bg-white">
        <TabComponent
          currentTab={currentTab}
          list={tabList}
          onTabChange={handleTabChange}
        />
      </div> */}
      
      <div className="mt-[60px]" ref={tabRefs.event}>
        {/* <HospitalEvent /> */}
        <EventTab />
      </div>
      
      <div className="mt-[60px]" ref={tabRefs.review}>
        <ReviewTab />
      </div>
      
      <div className="mt-[60px]" ref={tabRefs.info}>
        <InfoTab id={id} hospitalData={hospitalData} />
      </div>
    </div>
  );
};

export default HospitalDetailContent;
