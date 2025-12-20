"use client";

import { clsx } from "clsx";
import { TabItem } from "./TabItem";

interface TabHeaderProps {
  list: TabItem<string>[];
  currentTab: string;
  onTabChange?: (tab: string) => void;
}

const TabHeader = ({ list, currentTab, onTabChange }: TabHeaderProps) => {
  const handleClick = (key: string) => {
    if (onTabChange) {
      onTabChange(key);
    }
  };

  return (
    <ul className="flex justify-center items-center my-4 sticky top-[84px] z-sticky cursor-pointer">
      {list.map(({ key, name }) => (
        <li
          key={key}
          tabIndex={0}
          className={clsx(
            "w-[88px] text-center border-b border-[#eee] p-4 transition-colors duration-300 ease-in-out focus:border-black focus:border-b-2",
            currentTab === key && "border-b-2 border-black font-semibold"
          )}
          onClick={() => handleClick(key)}
        >
          {name}
        </li>
      ))}
    </ul>
  );
};

export default TabHeader;
