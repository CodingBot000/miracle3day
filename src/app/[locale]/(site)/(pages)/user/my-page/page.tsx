"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";
import dynamicImport from "next/dynamic";
import MyPageSkeleton from "./MyPageSkeleton";
import LoginRequiredModal from "@/components/template/modal/LoginRequiredModal";
import { ROUTE } from "@/router";

const MyPageMyInfo = dynamicImport(() => import("./MyPageMyInfo"), {
  ssr: false,
});

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
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
            setShowLoginModal(true);
          }
        } else {
          setShowLoginModal(true);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setShowLoginModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    router.push(ROUTE.LOGIN);
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
    router.push('/');
  };

  if (loading) {
    return <MyPageSkeleton />;
  }

  return (
    <>
      <LoginRequiredModal
        open={showLoginModal}
        onConfirm={handleLoginConfirm}
        onCancel={handleLoginCancel}
      />
      {user && (
        <SuspenseWrapper fallback={<MyPageSkeleton />}>
          <MyPageMyInfo user={user}/>
        </SuspenseWrapper>
      )}
    </>
  );
}
