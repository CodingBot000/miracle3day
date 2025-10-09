"use client";

import { useEffect } from "react";
import { useHeader } from "@/contexts/HeaderContext";

interface TransparentHeaderWrapperProps {
  children: React.ReactNode;
}

export default function TransparentHeaderWrapper({ children }: TransparentHeaderWrapperProps) {
  const { setTransparentMode } = useHeader();

  useEffect(() => {
    // 컴포넌트가 마운트될 때 투명 모드 활성화
    setTransparentMode(true);

    // 컴포넌트가 언마운트될 때 투명 모드 비활성화
    return () => {
      setTransparentMode(false);
    };
  }, [setTransparentMode]);

  return <>{children}</>;
}
