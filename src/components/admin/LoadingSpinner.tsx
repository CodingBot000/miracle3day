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

  const baseClass =
    "fixed inset-0 z-50 flex items-center justify-center";

  const backdropClass =
    "bg-black/10 backdrop-blur";

  const extraClass = backdrop
    ? `${baseClass} ${backdropClass}`
    : baseClass;

  return (
    <div className={extraClass}>
      {/* <CircleLoader color="#e09ddf" /> */}
      <CircleLoader color="#000" />
    </div>
  );
};

export default LoadingSpinner;
