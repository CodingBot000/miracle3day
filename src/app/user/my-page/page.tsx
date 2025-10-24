"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import MyPageSkeleton from "./MyPageSkeleton";

const MyPageMyInfo = dynamicImport(() => import("./MyPageMyInfo"), {
  ssr: false,
});

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/getUser');
        if (res.ok) {
          const userData = await res.json();
          if (userData.userInfo) {
            setUser(userData);
          } else {
            router.push('/api/auth/google/start');
          }
        } else {
          router.push('/api/auth/google/start');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/api/auth/google/start');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return <MyPageSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <SuspenseWrapper fallback={<MyPageSkeleton />}>
      <MyPageMyInfo user={user}/>
    </SuspenseWrapper>
  );
}
