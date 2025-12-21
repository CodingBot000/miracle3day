"use client";

import { ROUTE } from "@/router";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import LoginRequiredModal from "@/components/template/modal/LoginRequiredModal";
import { useUserStore } from "@/stores/useUserStore";
import { useUserStreamUnreadCount } from "@/hooks/useUserStreamUnreadCount";
import { useGetUser } from "@/hooks/useGetUser";

type AuthClientProps = {
  iconColor?: string;
};

export default function AuthClient({ iconColor = "#000" }: AuthClientProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { navigate } = useNavigation();
  const { userInfo, setUser } = useUserStore();
  const { data: userData, isLoading } = useGetUser();

  // Get unread count (always call hook, use results conditionally)
  const { totalUnreadCount, isLoading: unreadLoading } = useUserStreamUnreadCount();

  // Sync React Query data to Zustand store
  useEffect(() => {
    if (userData !== undefined) {
      setUser(userData || {});
    }
  }, [userData, setUser]);

  // Only show unread count when user is logged in
  const displayUnreadCount = userInfo?.id_uuid ? totalUnreadCount : 0;
  const showUnreadBadge = userInfo?.id_uuid && !unreadLoading && displayUnreadCount > 0;

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    navigate(ROUTE.LOGIN);
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
  };

  if (isLoading) return null;

  if (!userInfo?.id_uuid) {
    return (
      <>
        <button
          type="button"
          aria-label="Sign in with Google"
          className="flex items-center justify-center transition-opacity hover:opacity-80"
          onClick={handleLoginClick}
        >
          <UserIcon size={24} style={{ color: iconColor }} />
        </button>
        <LoginRequiredModal
          open={showLoginModal}
          onConfirm={handleLoginConfirm}
          onCancel={handleLoginCancel}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={ROUTE.MY_PAGE}>
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
            {userInfo.avatar ? (
              <Image
                src={userInfo.avatar}
                alt="Profile"
                width={48}
                height={48}
                quality={100}
                unoptimized={true}
                priority
                className="object-cover w-full h-full"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            ) : (
              <UserIcon size={24} style={{ color: iconColor }} />
            )}
          </div>
          {/* Unread message badge - automatically appears on desktop & mobile */}
          {showUnreadBadge && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border border-white">
              {displayUnreadCount > 9 ? '9+' : displayUnreadCount}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
