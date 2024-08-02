import { TabItem } from "@/components/molecules/tab/types";
import { TAB } from "@/constants/key";
import { handleRouter } from "@/utils";

export type TTabKey = "info" | "event" | "review";

export const tabList: TabItem<TTabKey>[] = [
  {
    key: "info",
    name: "Info",
    href: handleRouter(TAB)("info"),
  },
  {
    key: "event",
    name: "Event",
    href: handleRouter(TAB)("event"),
  },
  {
    key: "review",
    name: "Review",
    href: handleRouter(TAB)("review"),
  },
];
