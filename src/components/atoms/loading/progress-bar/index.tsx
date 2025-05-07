"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export const ProgressBar = () => {
  return (
    <Suspense fallback={null}>
      <ProgressBarContent />
    </Suspense>
  );
}; 

const ProgressBarContent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
      trickleSpeed: 200,
      minimum: 0.1,
    });

    const handleStart = () => {
      NProgress.start();
    };

    const handleStop = () => {
      NProgress.done();
    };

    // 라우트 변경 시작
    handleStart();

    // 라우트 변경 완료
    handleStop();

    return () => {
      handleStop();
    };
  }, [pathname, searchParams]);

  return null;
};

