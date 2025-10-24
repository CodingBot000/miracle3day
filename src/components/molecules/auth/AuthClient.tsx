"use client";

import { getUserAPI } from "@/app/api/auth/getUser";
import { UserOutputDto } from "@/app/api/auth/getUser/getUser.dto";
import { ROUTE } from "@/router";
import { SignInButton, useUser } from "@clerk/nextjs";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type AuthClientProps = {
  iconColor?: string;
};

export default function AuthClient({ iconColor = "#000" }: AuthClientProps) {
  // ✅ 모든 훅은 최상위에서 항상 호출
  const { isSignedIn, user, isLoaded } = useUser();
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const fetchAndSetUser = useCallback(async () => {
    try {
      if (!isLoaded || !isSignedIn) {
        setAvatarUrl("");
        return;
      }

      const info = await getUserAPI();
      console.log('AuthClient: getUserAPI result:', info);
      console.log('AuthClient: info.userInfo:', info?.userInfo);
      console.log('AuthClient: info.userInfo.userInfo:', info?.userInfo?.userInfo);
      if (!info?.userInfo) {
        setAvatarUrl("");
        return;
      }

      // 중첩된 userInfo 구조 확인
      const actualUserInfo = info.userInfo.userInfo || info.userInfo;
      const avatar = actualUserInfo.avatar || "";
      console.log('AuthClient: avatar from userInfo:', avatar);
      setAvatarUrl(avatar);
    } catch (err) {
      console.error("Error fetching user/avatar:", err);
      setAvatarUrl("");
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    // 준비 전엔 아무 것도 하지 않음
    if (!isLoaded) return;

    if (!isSignedIn) {
      setAvatarUrl("");
      return;
    }

    fetchAndSetUser();
  }, [isLoaded, isSignedIn, user?.id, fetchAndSetUser]);

  // ⬇️ 훅들 선언을 모두 끝낸 뒤에 렌더 분기
  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <SignInButton
        mode="modal"
        forceRedirectUrl="/auth/continue"
        fallbackRedirectUrl="/auth/continue"
        signUpForceRedirectUrl="/auth/continue"
        signUpFallbackRedirectUrl="/auth/continue"
      >
        <button
          type="button"
          aria-label="Sign in with Google"
          className="flex items-center justify-center transition-opacity hover:opacity-80"
        >
          <UserIcon size={24} style={{ color: iconColor }} />
        </button>
      </SignInButton>
    );
  }

  console.log('AuthClient: current avatarUrl state:', avatarUrl);
  
  return (
    <div className="flex items-center gap-2">
      <Link href={ROUTE.MY_PAGE}>
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
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
