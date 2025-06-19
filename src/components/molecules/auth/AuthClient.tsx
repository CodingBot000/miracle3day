"use client";

import Link from "next/link";
import { ROUTE } from "@/router";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogIn, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function AuthClient() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/getUser/session");
      const data = await res.json();
      setUser(data.user);
    };

    fetchUser();
  }, []);

  const text = (user: User) => {
    const { app_metadata, user_metadata } = user;
    const isSnsUser = app_metadata.provider !== "email";
    return isSnsUser ? user_metadata.name : user_metadata.nickname;
  };

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (!user) {
    return (
      <div className="flex justify-end items-center gap-2 w-auto min-w-fit">
        <Link href={ROUTE.LOGIN}>
          <Button variant="outline" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <LogIn className="h-4 w-4" />
            <span>LOGIN</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-end items-center gap-2 w-auto min-w-fit">
      <Link href={ROUTE.MY_PAGE}>
        <Button variant="outline" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
          <UserIcon className="h-4 w-4" />
          <span>{text(user) || user.email}</span>
        </Button>
      </Link>

      {isAdmin && (
        <Link href={ROUTE.UPLOAD_HOSPITAL}>
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
            업로드 바로가기
          </Button>
        </Link>
      )}
    </div>
  );
}
