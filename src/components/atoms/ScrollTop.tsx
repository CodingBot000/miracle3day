"use client";

import { useEffect } from "react";

const ScrollTop = () => {
  useEffect(() => {
    // 페이지 로딩 시 맨 위로 스크롤
    window.scrollTo(0, 0);
  }, []);

  return null;
};

export default ScrollTop;
