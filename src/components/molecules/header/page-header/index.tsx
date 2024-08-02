import styles from "./page-header.module.scss";
import { PropsWithChildren } from "react";

interface PageHeaderProps {
  name: string;
}

const PageHeader = ({ name, children }: PropsWithChildren<PageHeaderProps>) => {
  return (
    <div className={styles.header}>
      <h1>{name}</h1>

      <div className={styles.icons}>{children}</div>
    </div>
  );
};

export default PageHeader;
