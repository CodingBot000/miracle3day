"use client";

import Link from "next/link";
import { ROUTE } from "@/router";
import { User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { TABLE_MEMBERS } from "@/constants/tables";
import { useHeader } from "@/contexts/HeaderContext";
import { User } from "@supabase/supabase-js";

export default function AuthClient() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { isTransparentMode } = useHeader();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/getUser/session");
        const data = await res.json();
        setUser(data.user);

        // Fetch avatar if user exists
        if (data.user) {
          const { data: memberData } = await supabase
            .from(TABLE_MEMBERS)
            .select('avatar')
            .eq('uuid', data.user.id)
            .single();

          if (memberData?.avatar) {
            // Check if avatar is a URL or storage path
            if (memberData.avatar.startsWith('http://') || memberData.avatar.startsWith('https://')) {
              setAvatarUrl(memberData.avatar);
            } else {
              // It's a storage path
              const { data: publicUrlData } = supabase.storage
                .from('users')
                .getPublicUrl(memberData.avatar);
              setAvatarUrl(publicUrlData.publicUrl);
            }
          }
        }
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
          setAvatarUrl("");
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session.user);
          fetchUser(); // Refetch to get avatar
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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
