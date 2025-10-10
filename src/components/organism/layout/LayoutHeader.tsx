"use client"
import  Menu from "./MenuDeskTop";
import dynamic from "next/dynamic";
// import Auth from "@/components/molecules/auth";
import Logo from "@/components/molecules/Logo";
import LanguageSelector from "./LanguageSelector";

import { useState, useEffect } from "react";
import { Search, MessageSquareText } from "lucide-react";
import Link from "next/link";
import SearchPanel from "./SearchPanel";
import AuthClient from "@/components/molecules/auth/AuthClient";
import { createClient } from "@/utils/supabase/client";
import { useHeader } from "@/contexts/HeaderContext";

// const Auth = dynamic(() => import("@/components/molecules/auth/AuthServer"), {
//   ssr: false,
// });
const LayoutHeader = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isTransparentMode } = useHeader();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/getUser/session");
        const data = await res.json();
        console.log('[LayoutHeader] Fetched user:', data.user);
        setIsLoggedIn(!!data.user);
      } catch (error) {
        console.error('[LayoutHeader] Error fetching user:', error);
        setIsLoggedIn(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[LayoutHeader] Auth state changed:', event, !!session?.user);
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (!isTransparentMode) {
      setIsScrolled(false); // 투명 모드가 아니면 항상 불투명
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // LayoutHeader의 높이(108px) 이상 스크롤되면 불투명해지도록
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
      className={`fixed top-0 left-0 right-0 z-[200] flex items-center px-4 py-2 min-h-[88px] ease-in-out ${getHeaderStyles()}`}
      style={{
        transition: getTransitionStyle()
      }}
    >
      <div className="w-full flex justify-between items-center max-w-[1280px] mx-auto">
        <Logo />
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 transition-colors duration-300 ${getIconColor()}`}>
            {/* <div className="flex items-center">
              <Menu />
            </div> */}
            {/* community */}

              <Link href="/community">
                <MessageSquareText size={20} />
              </Link>

            <div>

              <button onClick={() => setShowSearch(true)}>
                <Search size={20} />
              </button>
            </div>
            <div>
              <LanguageSelector iconColor={isTransparentMode && !isScrolled ? 'white' : 'black'} />
            </div>
          </div>
          <div className="relative text-black">
            <AuthClient />
            {/* {isLoggedIn && (
              <Link href="/gamification/quize">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" />
              </Link>
            )} */}
          </div>
        </div>
      </div>
    </header>

{showSearch && <SearchPanel onClose={() => setShowSearch(false)} />}
    </>

  );
};

export default LayoutHeader;
