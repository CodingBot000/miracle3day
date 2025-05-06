import styles from "./spinner.module.scss";
import { CircleLoader } from "react-spinners";
interface LoadingSpinnerProps {
  show?: boolean;
  backdrop?: boolean;

  pageLoading?: boolean;
}

const LoadingSpinner = ({
  show = true,
  backdrop = false,
  pageLoading = false,
}: LoadingSpinnerProps) => {
  if (!show) return null;

  if (backdrop) {
    return (
      <div className={styles.backdrop}>
        <CircleLoader color="#e09ddf" />
        {/* <div className={styles.loader} /> */}
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className={styles.pageLoading}>
        {/* <div className={styles.loader} /> */}
        <CircleLoader color="#e09ddf" />
      </div>
    );
  }

  return (
    <div className={styles.scope}>
      {/* <div className={styles.loader} /> */}
      <CircleLoader color="#e09ddf" />
    </div>
  );
};

export default LoadingSpinner;
