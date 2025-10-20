"use client";

import Link from "next/link";
import { ROUTE } from "@/router";
import { User as UserIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/session/client";
import Image from "next/image";
import { useHeader } from "@/contexts/HeaderContext";
import type { SessionUser } from "@/lib/data_client";

export default function AuthClient() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { isTransparentMode } = useHeader();
  const sessionClient = createClient();

  const fetchAndSetUser = useCallback(async () => {
    try {
      const sessionRes = await fetch("/api/auth/getUser/session");
      if (!sessionRes.ok) {
        throw new Error(`Failed to fetch session: ${sessionRes.statusText}`);
      }

      const sessionData = await sessionRes.json();
      const currentUser = sessionData.user ?? null;
      setUser(currentUser);

      if (!currentUser?.id) {
        setAvatarUrl("");
        return;
      }

      const avatarRes = await fetch(`/api/auth/member/avatar?userId=${encodeURIComponent(currentUser.id)}`);
      if (!avatarRes.ok) {
        throw new Error(`Failed to fetch avatar: ${avatarRes.statusText}`);
      }

      const avatarData: { avatarUrl: string | null } = await avatarRes.json();
      setAvatarUrl(avatarData.avatarUrl ?? "");
    } catch (error) {
      console.error("Error fetching user or avatar:", error);
      setUser(null);
      setAvatarUrl("");
    }
  }, []);

  useEffect(() => {
    fetchAndSetUser();

    const {
      data: { subscription },
    } = sessionClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setAvatarUrl("");
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchAndSetUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAndSetUser, sessionClient.auth]);

  useEffect(() => {
    if (!isTransparentMode) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition >= 158);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransparentMode]);

  const iconColor = isTransparentMode && !isScrolled ? 'white' : 'black';

  if (!user) {
    return (
      <Link href={ROUTE.LOGIN}>
        <UserIcon
          size={24}
          style={{ color: iconColor }}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
      </Link>
    );
  }

  return (
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
  );
}
