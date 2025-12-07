import { useEffect, useState } from 'react';
import { useHospitalStore } from '@/stores/useHospitalUUIDStore';

interface User {
  id: number | string;
  email: string;
  id_uuid_hospital: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { clearHospitalData } = useHospitalStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[useAuth] 인증 확인 시작: /api/auth/me 호출');
      const response = await fetch('/api/admin/auth/me');
      console.log('[useAuth] 응답 상태:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[useAuth] 응답 데이터:', data);

        if (data.ok && data.user) {
          const userData = {
            id: data.user.id,
            email: data.user.email || '',
            id_uuid_hospital: data.user.id_uuid_hospital || null
          };
          console.log('[useAuth] ✅ 사용자 인증 성공:', userData);
          setUser(userData);
        } else {
          console.log('[useAuth] ❌ 응답에 사용자 정보 없음');
          setUser(null);
        }
      } else {
        console.log('[useAuth] ❌ 응답 실패:', response.status);
        setUser(null);
      }
    } catch (err) {
      console.error('[useAuth] ❌ 인증 확인 오류:', err);
      setError(err instanceof Error ? err : new Error('Auth check failed'));
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('[useAuth] 인증 확인 완료');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.ok) {
        await checkAuth(); // 로그인 성공 후 사용자 정보 업데이트
        return { success: true };
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (err) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      console.log('[useAuth] 로그아웃 시작');
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setUser(null);

      // Zustand 스토어 초기화 (보안)
      clearHospitalData();
      console.log('[useAuth] ✅ Zustand 스토어 클리어 완료');
    } catch (err) {
      console.error('[useAuth] ❌ 로그아웃 오류:', err);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    refreshAuth: checkAuth
  };
}