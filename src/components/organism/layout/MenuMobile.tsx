"use client";

import {
  Home,
  Stethoscope,
  Calendar,
  MapPin,
  Heart,
  Hospital,
} from "lucide-react";
import { ROUTE } from "@/router";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LocationEnum } from "@/constants";
import clsx from "clsx";
import AuthClient from "@/components/molecules/auth/AuthClient";
import { useMobileModeStore } from "@/stores/useMobileModeStore";
import { useEffect } from "react";

const MenuMobile = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locationNum = searchParams.get("locationNum") || LocationEnum.Apgujung;
  const { setMobileMode } = useMobileModeStore();

  // 모바일 화면 크기를 감지하여 store 업데이트
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint (Tailwind의 max-md와 동일)
      setMobileMode(isMobile);
    };

    // 초기 체크
    checkMobile();

    // resize 이벤트 리스너 등록
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setMobileMode]);

  const goTo = (targetPath: string) => {
    if (pathname === targetPath) return;
    router.push(targetPath);
  };

  return (
    <div
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-[100] bg-white p-2 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]",
        "hidden max-md:flex justify-around items-center"
      )}
    >
      <button
        onClick={() => goTo(ROUTE.HOME)}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <Home className="w-6 h-6" />
        <span className="text-xs text-[#333]">Home</span>
      </button>
      <button
        onClick={() => goTo(ROUTE.TREATMENT_INFO)}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <Stethoscope className="w-6 h-6" />
        <span className="text-xs text-[#333]">Procedure</span>
      </button>
      <button
        onClick={() => goTo(ROUTE.EVENT)}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <Calendar className="w-6 h-6" />
        <span className="text-xs text-[#333]">Event</span>
      </button>
      {/* <button
        onClick={() => goTo(ROUTE.LOCATION_DETAIL("") + locationNum)}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <MapPin className="w-6 h-6" />
        <span className="text-xs text-[#333]">Location</span>
      </button> */}
            <button
        onClick={() => goTo(ROUTE.HOSPITAL)}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <Hospital className="w-6 h-6" />
        <span className="text-xs text-[#333]">Clinics</span>
      </button>
      <div className="flex flex-col items-center gap-1 p-2 hover:opacity-80">
          <div className="relative text-black">
            <AuthClient iconColor={'black'} />
          </div>
        <span className="text-xs text-[#333]">My Page</span>
      </div>

      {/* <button
        onClick={() => goTo(ROUTE.FAVORITE)}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <Heart className="w-6 h-6" />
        <span className="text-xs text-[#333]">Favorite</span>
      </button> */}
    </div>
  );
};

export default MenuMobile;
