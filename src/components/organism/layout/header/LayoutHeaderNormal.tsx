"use client"

import Logo from "@/components/molecules/Logo";
import HeaderActions from "./HeaderActions";

import { useState, useEffect } from "react";
import { usePathname } from "@/i18n/routing";

import { useHeader } from "@/contexts/HeaderContext";
import { useMobileModeStore } from "@/stores/useMobileModeStore";
import { HEADER_HEIGHT } from "@/constants/common";
import { BackButton } from "@/components/BackButton";

const LayoutHeaderNormal = () => {
 
  const [scrollPosition, setScrollPosition] = useState(0);
  const { isTransparentMode } = useHeader();
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


  useEffect(() => {
    if (!isTransparentMode) {
      setScrollPosition(0);
      return;
    }

    const handleScroll = () => {
      const postScrollContainer = document.getElementById('post-scroll-container');

      let currentScrollPosition: number;
      if (postScrollContainer) {
        currentScrollPosition = postScrollContainer.scrollTop || 0;
      } else {
        currentScrollPosition = window.pageYOffset ||
                              document.documentElement.scrollTop ||
                              document.body.scrollTop || 0;
      }

      setScrollPosition(currentScrollPosition);
    };

    // 초기 실행
    handleScroll();

    // 스크롤 이벤트 등록
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isTransparentMode]);

  // 헤더 높이 (158px)를 기준으로 스크롤 진행도 계산 (0~1)
  
  const scrollProgress = isTransparentMode
    ? Math.min(scrollPosition / HEADER_HEIGHT, 1)
    : 1;

  // 배경 opacity 계산 (0.0 -> 0.95)
  const bgOpacity = scrollProgress * 0.95;

  // 텍스트 색상 계산 (흰색 -> 검정색)
  const isScrolled = scrollProgress > 0.5; // 50% 이상 스크롤되면 텍스트 색상 변경

  // 스타일 계산
  const getHeaderStyles = () => {
    if (!isTransparentMode) {
      // 투명 모드가 아닌 경우: 항상 배경이 있음
      return 'bg-white/95 backdrop-blur-md shadow-md';
    }
    // 투명 모드인 경우: 완전 투명 또는 동적 opacity
    if (scrollPosition === 0) {
      return 'bg-transparent';
    }
    return 'backdrop-blur-md shadow-md';
  };

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-header flex flex-col min-h-[62px] max-h-[88px] ease-in-out ${getHeaderStyles()}`}
      style={{
        backgroundColor: isTransparentMode && scrollPosition > 0
          ? `rgba(255, 255, 255, ${bgOpacity})`
          : undefined,
        transition: 'all 300ms ease-in-out',
      }}
    >
      <div className="w-full max-w-[1024px] mx-auto flex flex-col h-full">
        {/* Top Section - Main Content (fills remaining space) */}
        <div className="flex-1 flex items-center px-4">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BackButton  />
              <Logo />
            </div>
            {!isAuthPage && (
              <HeaderActions
                iconColor={isTransparentMode && !isScrolled ? 'white' : 'black'}
                isMobileMode={isMobileMode}
              />
            )}
          </div>
        </div>

        {/*
        <div className="h-[30px] flex items-center px-4 border-t border-gray-200/20">
          <div className="w-full max-w-[1080px] mx-auto">
            <BackButton iconColor={isTransparentMode && !isScrolled ? 'white' : 'black'} />
          </div>
        </div> */}
      </div>
    </header>


    </>

  );
};

export default LayoutHeaderNormal;
