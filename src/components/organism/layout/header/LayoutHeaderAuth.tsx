"use client"

import Logo from "@/components/molecules/Logo";
import { BackButton } from "@/components/BackButton";

/**
 * Auth 전용 헤더
 * - (auth) 라우팅 그룹에서만 사용
 * - 뒤로가기 + 로고만 표시 (HeaderActions 없음)
 */
const LayoutHeaderAuth = () => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-header flex flex-col justify-center min-h-[62px] max-h-[88px] ease-in-out bg-white text-black shadow-md"
    >
      <div className="w-full max-w-[1024px] mx-auto flex flex-col justify-center h-full">
        <div className="flex items-center px-4">
          <div className="w-full flex justify-between items-center">
            <BackButton />
            <Logo />
            {/* Auth 페이지는 뒤로가기 + 로고만 표시 */}
            <div className="w-6" /> {/* 레이아웃 균형을 위한 spacer */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default LayoutHeaderAuth;
