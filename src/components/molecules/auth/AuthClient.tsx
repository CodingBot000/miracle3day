"use client";

import { getUserAPI } from "@/app/api/auth/getUser";
import { UserOutputDto } from "@/app/api/auth/getUser/getUser.dto";
import { ROUTE } from "@/router";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginRequiredModal from "@/components/template/modal/LoginRequiredModal";

type AuthClientProps = {
  iconColor?: string;
};

export default function AuthClient({ iconColor = "#000" }: AuthClientProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/getUser');
      if (res.ok) {
        const data = await res.json();
        log.debug('Auth check checkAuth data', data);
        setUser(data.userInfo);
      } else {
        log.debug('Auth check checkAuth null', null);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check checkAuth error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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

  if (!user) {
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
          {user.avatar ? (
            <Image
              src={user.avatar}
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
