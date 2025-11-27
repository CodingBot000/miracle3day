"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ScrollTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    // 페이지 경로가 변경될 때마다 맨 위로 스크롤
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollTop;
