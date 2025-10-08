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

// const Auth = dynamic(() => import("@/components/molecules/auth/AuthServer"), {
//   ssr: false,
// });
const LayoutHeader = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // LayoutHeader의 높이(88px) 이상 스크롤되면 불투명해지도록
      setIsScrolled(scrollPosition >= 88);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    <header className={`fixed top-0 left-0 right-0 z-[200] flex items-center px-4 py-2 min-h-[88px] transition-all duration-500 ease-in-out ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="w-full flex justify-between items-center max-w-[1280px] mx-auto">
        <Logo />
        <div className="flex items-center gap-2">
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
            <LanguageSelector />
          </div>
          <div className="relative">
            <AuthClient />
            {isLoggedIn && (
              <Link href="/gamification/quize">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>

{showSearch && <SearchPanel onClose={() => setShowSearch(false)} />}
    </>

  );
};

export default LayoutHeader;
