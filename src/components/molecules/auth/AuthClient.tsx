"use client";

import { ROUTE } from "@/router";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginRequiredModal from "@/components/template/modal/LoginRequiredModal";
import { useUserStore } from "@/stores/useUserStore";

type AuthClientProps = {
  iconColor?: string;
};

export default function AuthClient({ iconColor = "#000" }: AuthClientProps) {
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const { userInfo, setUser } = useUserStore();

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/getUser');
      if (res.ok) {
        const data = await res.json();
        setUser(data.userInfo);
      } else {
        setUser({});
      }
    } catch (error) {
      console.error('[AuthClient] checkAuth error:', error);
      setUser({});
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    // 이미 store에 유저 정보가 있으면 API 호출 스킵
    if (userInfo?.id_uuid) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth, userInfo?.id_uuid]);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    router.push(ROUTE.LOGIN);
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
  };

  if (loading) return null;

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
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
          {userInfo.avatar ? (
            <Image
              src={userInfo.avatar}
              alt="Profile"
              width={25}
              height={25}
              className="object-cover"
            />
          ) : (
            <UserIcon size={24} style={{ color: iconColor }} />
          )}
        </div>
      </Link>
    </div>
  );
}
