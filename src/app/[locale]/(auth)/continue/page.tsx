'use client';

import { log } from '@/utils/logger';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/hooks/useNavigation';

export default function AuthContinuePage() {
  const [loading, setLoading] = useState(true);
  const { navigate } = useNavigation();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          log.debug('AuthContinuePage Auth check data:', data);
          if (data.auth && data.auth.status === 'active') {
            // 이미 인증된 사용자는 마이페이지로
            navigate('/user/my-page', { replace: true });
          } else if (data.auth && data.auth.status === 'pending') {
            // 약관 동의 필요
            navigate('/terms', { replace: true });
          } else {
            // 로그인 필요
            navigate('/api/auth/google/start', { replace: true });
          }
        } else {
          navigate('/api/auth/google/start', { replace: true });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/api/auth/google/start', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return null;
}
