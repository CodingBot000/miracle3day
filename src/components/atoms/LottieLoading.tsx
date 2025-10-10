'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LottieLoadingProps {
  size?: number;
  className?: string;
}

export default function LottieLoading({ size = 200, className = '' }: LottieLoadingProps) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <DotLottieReact
        src="/logo/loading_logo.lottie"
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  );
}
