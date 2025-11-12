'use client';

import Link from "next/link";
import Image from "next/image";;
import { ROUTE } from "@/router";

const STORAGE_KEY = 'treatment-protocol-category';

const Logo = () => {
  const handleLogoClick = () => {
    // Reset treatment protocol category to 'skin' when going home
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'skin');
    }
  };

  return (
    <div className="w-fit">
      <Link href={ROUTE.HOME} onClick={handleLogoClick}>
        <Image
          src="/logo/logo.png"
          alt="logo"
          width={172}
          height={42}
          className="w-[120px] h-auto sm:w-[140px] xs:w-[110px]"
        />
      </Link>
    </div>
  );
};

export default Logo;
