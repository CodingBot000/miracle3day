"use client";

import { useRef, useState } from "react";
import { tabList } from "./constant";
import dynamic from "next/dynamic";
import TabHeader from "@/components/molecules/tab/TabHeader";

type TabKey = 'event' | 'review' | 'info';

type TabRefs = {
  [key in TabKey]: React.RefObject<HTMLDivElement>;
};

interface HospitalDetailPageTabProps {
  tabRefs: TabRefs;
}

export default function HospitalDetailPageTab({ tabRefs }:HospitalDetailPageTabProps) {
  const [currentTab, setCurrentTab] = useState<TabKey>('event');

  const handleTabChange = (key: string) => {
    const element = tabRefs[key as keyof typeof tabRefs].current;
    if (element) {
      const tabMenuHeight = 150;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - tabMenuHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setCurrentTab(key as TabKey);
    }
  };

  return (
    <section>
      <TabHeader 
        currentTab={currentTab}
        list={tabList} 
        onTabChange={handleTabChange} 
      />
    </section>
  );
}

