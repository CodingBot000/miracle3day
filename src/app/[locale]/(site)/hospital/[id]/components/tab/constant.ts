import { TabItem } from "@/components/molecules/tab/TabItem";
import { TAB } from "@/constants/key";
import { handleRouter } from "@/utils";

// export type TTabKey = "info" | "event" | "review";
// export type TTabKey = "review" | "info" | "event";
export type TTabKey = "event" | "info" | "review";

export const tabList: TabItem<TTabKey>[] = [
  {
    key: "event",
    name: "Event",
  },
  {
    key: "info",
    name: "Info",
  },
  {
    key: "review",
    name: "Review",
  },
];
