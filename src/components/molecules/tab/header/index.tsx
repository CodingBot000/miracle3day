import styles from "./tab-header.module.scss";
import { clsx } from "clsx";
import { TabItem } from "../types";

interface TabHeaderProps {
  list: TabItem<string>[];
  currentTab: string;
  onTabChange?: (tab: string) => void;
}

const TabHeader = ({ list, currentTab, onTabChange }: TabHeaderProps) => {
  const linkStyle = (key: string) => {
    return clsx(styles.li, { [styles.active]: currentTab === key });
  };

  const handleClick = (key: string) => {
    // console.log("handleClick key:", key);
    
    if (onTabChange) {
      // console.log("handleClick onTabChange");
      onTabChange(key);
    }
  };

  return (
    <>
      <ul className={styles.menu}>
        {list.map(({ key, name }) => (
          <li 
            key={key} 
            className={linkStyle(key)} 
            onClick={() => handleClick(key)}
          >
            {name}
          </li>
        ))}
      </ul>
    </>
  );
};

export default TabHeader;
