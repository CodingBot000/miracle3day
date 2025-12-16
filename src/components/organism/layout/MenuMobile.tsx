"use client";

import {
  Home,
  Stethoscope,
  Calendar,
  MapPin,
  Heart,
  Hospital,
  MessageSquareText,
  Search,
} from "lucide-react";
import { ROUTE } from "@/router";
import { usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useNavigation } from "@/hooks/useNavigation";
import { LocationEnum } from "@/constants";
import clsx from "clsx";
import AuthClient from "@/components/molecules/auth/AuthClient";
import { useSearch } from "@/contexts/SearchContext";
import { useMobileModeStore } from "@/stores/useMobileModeStore";
import { useEffect, useState, useMemo } from "react";
import { usePlatform } from "@/hooks/usePlatform";

// 메뉴 아이템별 경로 매핑
const MENU_PATHS = {
  home: [ROUTE.HOME, "/home"],
  procedure: [ROUTE.TREATMENT_INFO, "/treatments_info", "/treatment"],
  community: ["/community"],
  clinics: [ROUTE.HOSPITAL, "/hospital"],
  mypage: [ROUTE.MY_PAGE, "/user/my-page", "/user"],
} as const;

type MenuKey = keyof typeof MENU_PATHS;

const STORAGE_KEY = "lastSelectedMenu";

// MenuMobile을 숨길 경로 패턴
const HIDDEN_PATHS = [
  /^\/community\/post\/\d+$/, // /community/post/[id]
];

const MenuMobile = () => {
  const { navigate } = useNavigation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { openSearch } = useSearch();
  const locationNum = searchParams.get("locationNum") || LocationEnum.Apgujung;
  const { setMobileMode } = useMobileModeStore();
  const { isWebView, isClient } = usePlatform();
  const [lastSelectedMenu, setLastSelectedMenu] = useState<MenuKey | null>(null);

  // 현재 경로에 해당하는 메뉴 찾기
  const getActiveMenuFromPath = (path: string): MenuKey | null => {
    for (const [menuKey, paths] of Object.entries(MENU_PATHS)) {
      if (paths.some((menuPath) => path === menuPath || path.startsWith(menuPath + "/"))) {
        return menuKey as MenuKey;
      }
    }
    return null;
  };

  // 현재 활성화된 메뉴 계산
  const activeMenu = useMemo(() => {
    const menuFromPath = getActiveMenuFromPath(pathname);
    if (menuFromPath) {
      return menuFromPath;
    }
    // 경로가 메뉴에 없으면 마지막 선택된 상태 유지
    return lastSelectedMenu;
  }, [pathname, lastSelectedMenu]);

  // 마지막 선택된 메뉴를 localStorage에서 불러오기 및 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as MenuKey | null;
      if (stored) {
        setLastSelectedMenu(stored);
      }
    }
  }, []);

  // 경로가 메뉴에 해당하면 저장
  useEffect(() => {
    const menuFromPath = getActiveMenuFromPath(pathname);
    if (menuFromPath) {
      setLastSelectedMenu(menuFromPath);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, menuFromPath);
      }
    }
  }, [pathname]);

  // 메뉴가 선택되었는지 확인
  const isActive = (menuKey: MenuKey): boolean => {
    return activeMenu === menuKey;
  };

  // 아이콘 색상 클래스
  const getIconColor = (menuKey: MenuKey): string => {
    return isActive(menuKey) ? "text-black" : "text-gray-400";
  };

  // 텍스트 색상 클래스
  const getTextColor = (menuKey: MenuKey): string => {
    return isActive(menuKey) ? "text-black" : "text-gray-400";
  };

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
    navigate(targetPath);
  };

  // 플랫폼 감지가 완료될 때까지 렌더링 지연 (깜빡임 방지)
  if (!isClient) {
    return null;
  }

  // 특정 경로에서는 MenuMobile 숨김
  const shouldHide = HIDDEN_PATHS.some((pattern) => pattern.test(pathname));
  if (shouldHide) {
    return null;
  }

  // 웹뷰(앱)에서는 MenuMobile을 표시하지 않음
  // if (isWebView) {
  //   return null;
  // } 

  return (
    <div
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-[100] bg-white p-2 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] h-16",
        "hidden max-md:flex justify-around items-center"
      )}
    >
      <button
        onClick={() => goTo(ROUTE.HOME)}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <Home className={clsx("w-6 h-6", getIconColor("home"))} />
        <span className={clsx("text-xs", getTextColor("home"))}>Home</span>
      </button>
      {/* <button
        onClick={() => goTo(ROUTE.TREATMENT_INFO)}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <Stethoscope className={clsx("w-6 h-6", getIconColor("procedure"))} />
        <span className={clsx("text-xs", getTextColor("procedure"))}>Procedure</span>
      </button> */}
      <button
        onClick={() => goTo(ROUTE.RECOMMEND_ESTIMATE)}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <Stethoscope className={clsx("w-6 h-6", getIconColor("procedure"))} />
        <span className={clsx("text-xs", getTextColor("procedure"))}>AI-Match</span>
      </button>

      <button
        onClick={openSearch}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <Search className="w-6 h-6 text-gray-400" />
        <span className="text-xs text-gray-400">Search</span>
      </button>

      <button
        onClick={() => goTo("/community")}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <MessageSquareText size={20} className={getIconColor("community")} />
        <span className={clsx("text-xs", getTextColor("community"))}>Community</span>
      </button>
      {/* <button
        onClick={() => goTo(ROUTE.EVENT)}
        className="flex flex-col items-center gap-1 p-2 hover:opacity-80"
      >
        <Calendar className="w-6 h-6" />
        <span className="text-xs text-[#333]">Event</span>
      </button> */}
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
        <Hospital className={clsx("w-6 h-6", getIconColor("clinics"))} />
        <span className={clsx("text-xs", getTextColor("clinics"))}>Clinics</span>
      </button>
      <div className="flex flex-col items-center gap-1 p-2 hover:opacity-80">
        <div className="relative">
          <AuthClient iconColor={isActive("mypage") ? "#000" : "#9ca3af"} />
        </div>
        <span className={clsx("text-xs", getTextColor("mypage"))}>My Page</span>
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
