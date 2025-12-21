"use client"

import Logo from "@/components/molecules/Logo";
import HeaderActions from "./HeaderActions";

import { useEffect } from "react";
import { usePathname } from "@/i18n/routing";
import { useMobileModeStore } from "@/stores/useMobileModeStore";
import { BackButton } from "@/components/BackButton";

const LayoutHeaderAuth = () => {
 
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
      className={`fixed top-0 left-0 right-0 z-header flex flex-col justify-center min-h-[62px] max-h-[88px] ease-in-out bg-white text-black shadow-md`}
    >
      <div className="w-full max-w-[1024px] mx-auto flex flex-col justify-center h-full">
        {/* Top Section - Main Content (fills remaining space) */}
        <div className="flex items-center px-4">
          <div className="w-full flex justify-between items-center">
            <BackButton  />
            <Logo />
            {!isAuthPage && (
              <HeaderActions iconColor="black" isMobileMode={isMobileMode} />
            )}
          </div>
        </div>
        {/* <div className="h-[30px] flex items-center px-4 border-t border-gray-200/20">
          <div className="w-full max-w-[1080px] mx-auto">
            <BackButton iconColor={'black'} />
          </div>
        </div> */}
      </div>
    </header>
    </>

  );
};

export default LayoutHeaderAuth;
