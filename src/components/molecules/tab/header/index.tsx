import styles from "./tab-header.module.scss";

import Link from "next/link";
import { clsx } from "clsx";
import { TabItem } from "../types";

interface TabHeaderProps {
  list: TabItem<string>[];
  currentTab: string;
}

const TabHeader = ({ list, currentTab }: TabHeaderProps) => {
  const linkStyle = (key: string) => {
    return clsx(styles.li, { [styles.active]: currentTab === key });
  };

  return (
    <>
      <ul className={styles.menu}>
        {list.map(({ key, name, href }) => (
          <Link key={key} href={href} scroll={false}>
            <li className={linkStyle(key)}>{name}</li>
          </Link>
        ))}
      </ul>
    </>
  );
};

export default TabHeader;
