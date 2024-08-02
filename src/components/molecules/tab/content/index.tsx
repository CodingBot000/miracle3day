import styles from "./tab-content.module.scss";

const TabContent = ({ component: Component }: { component: JSX.Element }) => {
  return <div className={styles.section}>{Component}</div>;
};

export default TabContent;
