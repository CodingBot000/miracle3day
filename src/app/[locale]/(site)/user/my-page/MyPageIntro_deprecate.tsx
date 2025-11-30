"use client";

import { Bell, Settings } from "lucide-react";
import Link from "next/link";
import { Heart, ShoppingBag, Ticket, Clock } from "lucide-react";
import { UserOutputDto } from "@/app/api/auth/getUser/getUser.dto";

interface MenuItem {
  title: string;
  href: string;
}

const MY_ACTIVITY_MENU: MenuItem[] = [
  { title: "Purchase list", href: "/user/purchases" },
  { title: "My Requests", href: "/user/requests" },
  { title: "Managing review", href: "/user/reviews" },
  { title: "Treatment inquiry", href: "/user/treatments" },
  { title: "Managing comment", href: "/user/comments" },
  { title: "SkinLog", href: "/user/skinlog" },
];

const CUSTOMER_SUPPORT_MENU: MenuItem[] = [
  { title: "BeautyWell promotion", href: "/promotions" },
  { title: "FAQ", href: "/faq" },
  { title: "Notice", href: "/notice" },
  { title: "Side effect assurance care service", href: "/care-service" },
  { title: "Terms of service and policies", href: "/terms" },
];
interface MyPageIntroClientProps {
    user: UserOutputDto;
  }
  

    
export default function MyPageIntro({ user }: MyPageIntroClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold">{user?.userInfo?.nickname}</span>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Points & Coupons */}
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span>Point</span>
              <Link href="/points" className="flex items-center">
                <span className="font-semibold">0P</span>
                <span className="ml-1">›</span>
              </Link>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Coupon</span>
              <Link href="/coupons" className="flex items-center">
                <span className="font-semibold">0piece(s)</span>
                <span className="ml-1">›</span>
              </Link>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>BeautyWell Cash</span>
              <Link href="/cash" className="flex items-center">
                <span className="font-semibold">₩0</span>
                <span className="ml-1">›</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            <Link href="/bookmarks" className="flex flex-col items-center">
              <div className="p-3 rounded-full hover:bg-gray-100">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-sm mt-1">Bookmark</span>
              <span className="text-xs text-gray-500">0</span>
            </Link>
            <Link href="/cart" className="flex flex-col items-center">
              <div className="p-3 rounded-full hover:bg-gray-100">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-sm mt-1">Cart</span>
              <span className="text-xs text-gray-500">0</span>
            </Link>
            <Link href="/tickets" className="flex flex-col items-center">
              <div className="p-3 rounded-full hover:bg-gray-100">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="text-sm mt-1">Ticket</span>
              <span className="text-xs text-gray-500">0</span>
            </Link>
            <Link href="/recently-viewed" className="flex flex-col items-center">
              <div className="p-3 rounded-full hover:bg-gray-100">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-sm mt-1">Recently viewed</span>
              <span className="text-xs text-gray-500">0</span>
            </Link>
          </div>
        </div>

        {/* Special Benefits */}
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Special Benefits For You</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <div className="text-sm">후기 도움돼요 받고</div>
                  <div className="text-pink-500 font-semibold">10P 받기</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">✓</span>
                </div>
                <div>
                  <div className="text-sm">후기를 작성하고</div>
                  <div className="text-pink-500 font-semibold">최대 5,000P 받기</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Activity Section */}
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">My activity</h2>
          <div className="space-y-4">
            {MY_ACTIVITY_MENU.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex justify-between items-center py-2 hover:bg-gray-50 px-2 rounded"
              >
                <span>{item.title}</span>
                <span className="text-gray-400">›</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Share Banner */}
        <div className="bg-blue-500 text-white rounded-lg p-6 mb-4 shadow-sm">
          <div className="flex justify-between items-center">
            <span>Share and earn up to 15,000P!</span>
            <div className="flex space-x-2">
              {/* Add your emoji/icon components here */}
            </div>
          </div>
        </div>

        {/* Customer Support Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Customer Support</h2>
          <div className="space-y-4">
            {CUSTOMER_SUPPORT_MENU.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex justify-between items-center py-2 hover:bg-gray-50 px-2 rounded"
              >
                <span>{item.title}</span>
                <span className="text-gray-400">›</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
