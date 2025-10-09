"use client";

import { useHeader } from "@/contexts/HeaderContext";

interface MainContentProps {
  children: React.ReactNode;
}

// MainContent 컴포넌트: 투명 모드가 아닐 때 헤더 높이만큼 패딩 추가
export default function MainContent({ children }: MainContentProps) {
  const { isTransparentMode } = useHeader();
  
  return (
    <div className={isTransparentMode ? '' : 'pt-[88px]'}>
      {children}
    </div>
  );
}
