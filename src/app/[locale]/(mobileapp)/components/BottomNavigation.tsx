"use client";

import { Home, Package, Heart, User, Sparkles, Factory, Trophy } from "lucide-react";
import { usePathname } from "@/i18n/routing";
import { useNavigation } from "@/hooks/useNavigation";
import clsx from "clsx";

// 메뉴 아이템 타입
interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  matchPaths: string[]; // 해당 메뉴가 활성화될 경로들
}

// 메뉴 아이템 설정 - 나중에 수정 가능
const MENU_ITEMS: MenuItem[] = [
  {
    key: "home",
    label: "홈",
    icon: <Home className="w-6 h-6" />,
    path: "/skincare-main",
    matchPaths: ["/skincare-main"],
  },
  // {
  //   key: "routine",
  //   label: "루틴",
  //   icon: <Sparkles className="w-6 h-6" />,
  //   path: "/skincare-onboarding",
  //   matchPaths: ["/skincare-onboarding"],
  // },
    {
    key: "community",
    label: "Community",
    icon: <Sparkles className="w-6 h-6" />,
    path: "/community",
    matchPaths: ["/community"],
  },
  {
    key: "products",
    label: "제품",
    icon: <Package className="w-6 h-6" />,
    path: "/skincare-products",
    matchPaths: ["/skincare-products"],
  },
  {
    key: "beautybox",
    label: "뷰티박스",
    icon: <Heart className="w-6 h-6" />,
    path: "/skincare-my-beauty-box",
    matchPaths: ["/skincare-my-beauty-box"],
  },
  {
    key: "mimotok",
    label: "Mimotok",
    icon: <Trophy className="w-6 h-6" />,
    path: "/home",
    matchPaths: ["/home"],
  },
  
  {
    key: "mypage",
    label: "마이",
    icon: <User className="w-6 h-6" />,
    path: "/skincare-auth/my-page",
    matchPaths: ["/skincare-auth", "/skincare-mypage"],
  },
];

const BottomNavigation = () => {
  const { navigate } = useNavigation();
  const pathname = usePathname();

  // 현재 경로가 해당 메뉴에 해당하는지 확인
  const isActive = (item: MenuItem): boolean => {
    return item.matchPaths.some(
      (menuPath) => pathname === menuPath || pathname.startsWith(menuPath + "/")
    );
  };

  const handleNavigate = (path: string) => {
    if (pathname === path) return;
    navigate(path);
  };

  return (
    <nav className="flex-shrink-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {MENU_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.path)}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                "hover:bg-gray-50 active:bg-gray-100 rounded-lg"
              )}
            >
              <span
                className={clsx(
                  "transition-colors",
                  active ? "text-pink-500" : "text-gray-400"
                )}
              >
                {item.icon}
              </span>
              <span
                className={clsx(
                  "text-xs font-medium transition-colors",
                  active ? "text-pink-500" : "text-gray-400"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
