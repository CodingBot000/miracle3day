'use client';

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LoadingSpinnerProps {
  show?: boolean;
  backdrop?: boolean;
  pageLoading?: boolean;
  size?: number;
}

const LoadingSpinner = ({
  show = true,
  backdrop = false,
  pageLoading = false,
  size = 200,
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
      <DotLottieReact
        src="/logo/loading_logo.lottie"
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  );

};

export default LoadingSpinner;
