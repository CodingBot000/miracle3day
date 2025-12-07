
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function OverflowFixer() {
  const pathname = usePathname();

  useEffect(() => {
    // 페이지가 바뀔 때마다 overflow 초기화
    document.body.style.overflow = "";
  }, [pathname]);

  return null;
}
