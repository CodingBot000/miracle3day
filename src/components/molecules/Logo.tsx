'use client';

import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { ROUTE } from "@/router";

const STORAGE_KEY = 'treatment-protocol-category';

const Logo = () => {
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Link의 기본 동작 방지

    // Reset treatment protocol category to 'skin' when going home
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'skin');

      // 모든 브라우저 히스토리 초기화하고 홈으로 이동
      window.history.pushState(null, '', ROUTE.HOME);
      router.replace(ROUTE.HOME);
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
