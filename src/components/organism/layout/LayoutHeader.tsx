"use client"
// import Auth from "@/components/molecules/auth";
import Logo from "@/components/molecules/Logo";
import LanguageSelector from "./LanguageSelector";
import BackButton from "./BackButton";

import { useState, useEffect } from "react";
import { Search, MessageSquareText, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchPanel from "./SearchPanel";
import AuthClient from "@/components/molecules/auth/AuthClient";
import { useHeader } from "@/contexts/HeaderContext";
import { useMobileModeStore } from "@/stores/useMobileModeStore";


// const Auth = dynamic(() => import("@/components/molecules/auth/AuthServer"), {
//   ssr: false,
// });
const LayoutHeader = () => {
  const [showSearch, setShowSearch] = useState(false);
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
      console.log('📱 Mobile mode is active!');
      // 여기서 모바일 모드일 때의 레이아웃 변경 로직을 추가하세요
      // 예: setState, 스타일 변경, 특정 요소 숨기기 등
    } else {
      console.log('💻 Desktop mode is active');
    }
  }, [isMobileMode]);


  useEffect(() => {
    if (!isTransparentMode) {
      setScrollPosition(0); // 투명 모드가 아니면 스크롤 위치 리셋
      return;
    }

    const handleScroll = () => {
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      setScrollPosition(currentScrollPosition);
    };

    // Check initial scroll position immediately
    handleScroll();

    // Also check after a brief delay to catch any layout shifts
    const timeoutId = setTimeout(handleScroll, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [isTransparentMode]);

  // 헤더 높이 (158px)를 기준으로 스크롤 진행도 계산 (0~1)
  const HEADER_HEIGHT = 158;
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

  const getIconColor = () => {
    if (!isTransparentMode) {
      return 'text-black';
    }
    return isScrolled ? 'text-black' : 'text-white';
  };

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-[200] flex flex-col min-h-[88px] max-h-[128px] ease-in-out ${getHeaderStyles()}`}
      style={{
        backgroundColor: isTransparentMode && scrollPosition > 0
          ? `rgba(255, 255, 255, ${bgOpacity})`
          : undefined,
        transition: 'all 300ms ease-in-out',
      }}
    >
      {/* Top Section - Main Content (fills remaining space) */}
      <div className="flex-1 flex items-center px-4">
        <div className="w-full flex justify-between items-center max-w-[1080px] mx-auto">
          <Logo />
          {!isAuthPage && (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 transition-colors duration-300 ${getIconColor()}`}>
                {/* community */}
                {!isMobileMode && (
                  <Link href="/community">
                    <MessageSquareText size={20} />
                  </Link>
                )}

                {/* <div>
                  <button onClick={() => setShowSearch(true)}>
                    <Search size={20} />
                  </button>
                </div> */}
                <div>
                  <LanguageSelector iconColor={isTransparentMode && !isScrolled ? 'white' : 'black'} />
                </div>
              </div>
              {!isMobileMode && (
              <div className="relative text-black">
                <AuthClient iconColor={isTransparentMode && !isScrolled ? 'white' : 'black'} />
              </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Back Button (fixed 40px height) */}
      {!isAuthPage && (
        <div className="h-[30px] flex items-center px-4 border-t border-gray-200/20">
          <div className="w-full max-w-[1080px] mx-auto">
          {!isHomePage && (
            <BackButton iconColor={isTransparentMode && !isScrolled ? 'white' : 'black'} />
          )}
          </div>
        </div>
      )}
      
    </header>

{showSearch && <SearchPanel onClose={() => setShowSearch(false)} />}
    </>

  );
};

export default LayoutHeader;
