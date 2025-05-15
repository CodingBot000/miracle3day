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
    "bg-black/30 backdrop-blur-sm";

  const extraClass = backdrop
    ? `${baseClass} ${backdropClass}`
    : baseClass;

  return (
    <div className={extraClass}>
      <CircleLoader color="#e09ddf" />
    </div>
  );
};

export default LoadingSpinner;
