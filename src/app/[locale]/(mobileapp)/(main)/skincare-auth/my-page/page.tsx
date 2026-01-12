"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import MyPageSkeleton from "./MyPageSkeleton";
import BackHeader from "@/components/mobileapp/BackHeader";

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
            // 로그인 안됨 → 바로 skincare 로그인 페이지로 이동
            router.replace('/skincare-auth/login');
          }
        } else {
          router.replace('/skincare-auth/login');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.replace('/skincare-auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return <MyPageSkeleton />;
  }

  return (
    <>
      <BackHeader title="My Page" onBack={() => router.push('/skincare-main')} />
      {user && (
        <SuspenseWrapper fallback={<MyPageSkeleton />}>
          <MyPageMyInfo user={user}/>
        </SuspenseWrapper>
      )}
    </>
  );
}
