"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const PageTransitionOverlay = () => {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300); // 페이지 전환 애니메이션 시간

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isPageLoading) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full z-maximum bg-black/30"
      aria-hidden="true"
    />
  );
}; 