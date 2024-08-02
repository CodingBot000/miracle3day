import TabContent from "./content";
import TabHeader from "./header";
import { TabItem } from "./types";

import styles from "./styles/tab.module.scss";

interface TabComponentProps<T extends string> {
  component: JSX.Element;
  currentTab: string;
  list: TabItem<T>[];
}

const TabComponent = <T extends string>({
  component: Component,
  currentTab,
  list,
}: TabComponentProps<T>) => {
  return (
    <section className={styles.tab_wrapper}>
      <TabHeader currentTab={currentTab} list={list} />
      <TabContent component={Component} />
    </section>
  );
};

export default TabComponent;
