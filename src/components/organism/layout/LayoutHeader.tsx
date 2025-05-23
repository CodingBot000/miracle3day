"use client"
import  Menu from "./MenuDeskTop";
import dynamic from "next/dynamic";
// import Auth from "@/components/molecules/auth";
import Logo from "@/components/molecules/Logo";
import LanguageSelector from "./LanguageSelector";

import { useState } from "react";
import { Search } from "lucide-react";
import SearchPanel from "./SearchPanel";
import AuthClient from "@/components/molecules/auth/AuthClient";

// const Auth = dynamic(() => import("@/components/molecules/auth/AuthServer"), {
//   ssr: false,
// });
const LayoutHeader = () => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-10 bg-background flex items-center px-4 py-2 min-h-[88px]">
      <div className="w-full flex justify-between items-center max-w-[1280px] mx-auto">
        <Logo />
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Menu />
          </div>
          <div>

            <button onClick={() => setShowSearch(true)}>
              <Search size={20} />
            </button>
          </div>
          <div>
            <LanguageSelector />
          </div>
          <div className="flex items-center gap-2">
            <AuthClient />
          </div>
        </div>
      </div>
    </header>

{showSearch && <SearchPanel onClose={() => setShowSearch(false)} />}
    </>

  );
};

export default LayoutHeader;