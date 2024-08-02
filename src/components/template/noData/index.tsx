import styles from "./noData.module.scss";

interface NoDataProps {
  label?: string;
}

export const NoData = ({ label }: NoDataProps) => {
  return <div className={styles.noData}>{label || "No Data"}</div>;
};
