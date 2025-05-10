"use client"
import { Menu } from "../sidebar/menu";
import dynamic from "next/dynamic";
// import Auth from "@/components/molecules/auth";
import Logo from "@/components/molecules/logo";
import LanguageDropdown from "../language";

import { useState } from "react";
import { Search } from "lucide-react";
import SearchPanel from "../search/SearchPanel";
import AuthClient from "@/components/molecules/auth/AuthClient";

// const Auth = dynamic(() => import("@/components/molecules/auth/AuthServer"), {
//   ssr: false,
// });
export const LayoutHeader = () => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-10 bg-[#f2f4f2] flex items-center px-4 py-2 min-h-[88px]">
      <div className="w-full flex justify-between items-center max-w-[1280px] mx-auto">
        <Logo />
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Menu />
          </div>
          <div>
            {/* <SearchBox /> */}
            <button onClick={() => setShowSearch(true)}>
              <Search size={20} />
            </button>
          </div>
          <div>
            <LanguageDropdown />
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
