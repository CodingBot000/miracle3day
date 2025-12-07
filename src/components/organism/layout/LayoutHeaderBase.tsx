"use client"

import Logo from "@/components/molecules/Logo";
import BackButton from "../../common/BackButton";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";

import { useHeader } from "@/contexts/HeaderContext";
import { useMobileModeStore } from "@/stores/useMobileModeStore";

const LayoutHeaderBase = () => {
 
  // const [scrollPosition, setScrollPosition] = useState(0);
  // const { isTransparentMode } = useHeader();
  const { isMobileMode } = useMobileModeStore();
  const pathname = usePathname();

  // Check if current page is home
  const isHomePage = pathname === '/' || pathname === '/home';

  // Check if current page is auth (login, terms, etc.)
  const isAuthPage = pathname?.startsWith('/auth') ?? false;

  // 모바일 모드일 때 LayoutHeader의 스타일을 조정할 수 있습니다
  useEffect(() => {
    if (isMobileMode) {
      // 여기서 모바일 모드일 때의 레이아웃 변경 로직을 추가하세요
      // 예: setState, 스타일 변경, 특정 요소 숨기기 등
    }
  }, [isMobileMode]);

 
  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-[200] flex flex-col min-h-[88px] max-h-[128px] ease-in-out bg-white text-black shadow-md`}
    >
      {/* Top Section - Main Content (fills remaining space) */}
      <div className="flex-1 flex items-center px-4">
        <div className="w-full flex justify-between items-center max-w-[1080px] mx-auto">
          <Logo />
        
        </div>
      </div>
        <div className="h-[30px] flex items-center px-4 border-t border-gray-200/20">
          <div className="w-full max-w-[1080px] mx-auto">
            <BackButton iconColor={'black'} />
          </div>
        </div>
    </header>
    </>

  );
};

export default LayoutHeaderBase;
