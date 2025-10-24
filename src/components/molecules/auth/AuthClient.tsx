"use client";

import { getUserAPI } from "@/app/api/auth/getUser";
import { UserOutputDto } from "@/app/api/auth/getUser/getUser.dto";
import { ROUTE } from "@/router";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type AuthClientProps = {
  iconColor?: string;
};

export default function AuthClient({ iconColor = "#000" }: AuthClientProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUser(data.auth);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) return null;

  if (!user || user.status !== 'active') {
    return (
      <Link href="/api/auth/google/start">
        <button
          type="button"
          aria-label="Sign in with Google"
          className="flex items-center justify-center transition-opacity hover:opacity-80"
        >
          <UserIcon size={24} style={{ color: iconColor }} />
        </button>
      </Link>
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
