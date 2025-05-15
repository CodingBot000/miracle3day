import TabContent from "./TabContent";
import TabHeader from "./TabHeader";
import { TabItem } from "./TabItem";

import styles from "./styles/tab.module.scss";

interface TabComponentProps<T extends string> {
  // component: JSX.Element;
  currentTab: string;
  list: TabItem<T>[];
  onTabChange?: (tab: string) => void;
}

const TabComponent = <T extends string>({
  // component: Component,
  currentTab,
  list,
  onTabChange,
}: TabComponentProps<T>) => {
  return (
    <section className={styles.tab_wrapper}>
      <TabHeader currentTab={currentTab} list={list} onTabChange={onTabChange} />
      {/* <TabContent component={Component} /> */}
    </section>
  );
};



export default TabComponent;
