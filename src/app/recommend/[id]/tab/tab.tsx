import TabComponent from "@/components/molecules/tab";

import { TTabKey, tabList } from "./";
import { Suspense } from "react";
import LoadingSpinner from "@/components/atoms/loading/spinner";
import dynamic from "next/dynamic";

const Event = dynamic(() => import("./event"));
const Review = dynamic(() => import("./review"));
const Hospital = dynamic(() => import("./hospital"));

interface RecommendTabProps {
  currentTab: string;
}

export const RecommendTab = ({ currentTab }: RecommendTabProps) => {
  const Component: Record<TTabKey & string, JSX.Element> = {
    event: <Event />,
    reviews: <Review />,
    hospitals: <Hospital />,
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TabComponent
        // component={Component[currentTab as TTabKey]}
        currentTab={currentTab}
        list={tabList}
      />
    </Suspense>
  );
};
