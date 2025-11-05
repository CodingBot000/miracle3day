import { TabItem } from "@/components/molecules/tab/TabItem";
import { TAB } from "@/constants/key";
import { handleRouter } from "@/utils";

export type TTabKey = "event" | "reviews" | "hospitals";

export const tabList: TabItem<TTabKey>[] = [
  {
    key: "event",
    name: "Event",
    // href: handleRouter(TAB)("event"),
  },
  {
    key: "reviews",
    name: "Reviews",
    // href: handleRouter(TAB)("reviews"),
  },
  {
    key: "hospitals",
    name: "Hospitals",
    // href: handleRouter(TAB)("hospitals"),
  },
];
