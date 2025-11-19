'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthContinuePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          console.log('AuthContinuePage Auth check data:', data);
          if (data.auth && data.auth.status === 'active') {
            // 이미 인증된 사용자는 마이페이지로
            router.replace('/user/my-page');
          } else if (data.auth && data.auth.status === 'pending') {
            // 약관 동의 필요
            router.replace('/terms');
          } else {
            // 로그인 필요
            router.replace('/api/auth/google/start');
          }
        } else {
          router.replace('/api/auth/google/start');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/api/auth/google/start');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return null;
}
