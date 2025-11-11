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
  const [isScrolled, setIsScrolled] = useState(false);
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
      setIsScrolled(false); // 투명 모드가 아니면 항상 불투명
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // LayoutHeader의 높이 이상 스크롤되면 불투명해지도록
      setIsScrolled(scrollPosition >= 158);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransparentMode]);

  // 스타일 계산
  const getHeaderStyles = () => {
    if (!isTransparentMode) {
      // 투명 모드가 아닌 경우: 항상 배경이 있음
      return 'bg-white/95 backdrop-blur-md shadow-md';
    }
    // 투명 모드인 경우: 스크롤에 따라 변경
    return isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent';
  };

  const getIconColor = () => {
    if (!isTransparentMode) {
      // 투명 모드가 아닌 경우: 항상 검정색
      return 'text-black';
    }
    // 투명 모드인 경우: 스크롤에 따라 변경
    return isScrolled ? 'text-black' : 'text-white';
  };

  const getTransitionStyle = () => {
    if (!isTransparentMode) {
      return 'all 300ms ease-in-out'; // 일반 모드는 빠른 전환
    }
    return isScrolled
      ? 'all 2000ms ease-in-out'  // 투명→불투명: 2초
      : 'all 500ms ease-in-out';   // 불투명→투명: 0.5초
  };

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-[200] flex flex-col min-h-[88px] max-h-[128px] ease-in-out ${getHeaderStyles()}`}
      style={{
        transition: getTransitionStyle(),
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
