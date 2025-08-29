"use client";

import Link from "next/link";
import { ROUTE } from "@/router";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogIn, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AuthClient() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/getUser/session");
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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
