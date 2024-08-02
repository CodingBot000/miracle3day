import { PropsWithChildren } from "react";
import styles from "./chip.module.scss";

export const Chip = ({ children }: PropsWithChildren) => {
  return <p className={styles.chip}>{children}</p>;
};
