import { tabList } from "./constant";

import TabComponent from "@/components/molecules/tab";

import dynamic from "next/dynamic";

const InfoTab = dynamic(() => import("./info"));
const EventTab = dynamic(() => import("./event"));
const ReviewTab = dynamic(() => import("./review"));

interface HospitalTabProps {
  currentTab: string;
  id: string;
}

const HospitalTab = ({ currentTab, id }: HospitalTabProps) => {
  const Component: Record<string, JSX.Element> = {
    info: <InfoTab id={id} />,
    event: <EventTab />,
    review: <ReviewTab />,
  };

  return (
    <TabComponent
      component={Component[currentTab]}
      currentTab={currentTab}
      list={tabList}
    />
  );
};

export default HospitalTab;
