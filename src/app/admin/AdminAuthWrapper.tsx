'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminPageClient from './AdminPageClient';
import { useAuth } from '@/hooks/useAuth';
import { useAlarmStore } from '@/stores/useHospitalUUIDStore';
import { api } from '@/lib/admin/api-client';

export default function AdminAuthWrapper() {
  const router = useRouter();
  const [hasClinicInfo, setHasClinicInfo] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  const { user, isLoading: sessionLoading, error: sessionError } = useAuth();

  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async () => {
      if (!user) {
        if (mounted) {
          router.push('/admin/login');
        }
        return;
      }

      try {
        console.log('[AdminAuthWrapper] 사용자 정보:', user);
        setUserEmail(user.email || '');

        // user.id_uuid_hospital이 있으면 이미 병원 정보가 있는 것
        if (user.id_uuid_hospital) {
          console.log('[AdminAuthWrapper] ✅ id_uuid_hospital 발견:', user.id_uuid_hospital);
          if (mounted) {
            setHasClinicInfo(true);
          }
          return;
        }

        console.log('[AdminAuthWrapper] id_uuid_hospital 없음 - API로 확인');

        // Use API endpoint instead of direct Supabase access
        const authResult = await api.admin.verifyAuth(user.id);

        console.log('[AdminAuthWrapper] API 응답:', authResult);

        if (!authResult.success || !authResult.data) {
          throw new Error(authResult.error || 'Failed to verify admin');
        }

        const { adminExists, hasClinicInfo: hasClinic, admin, hospital } = authResult.data;

        console.log('[AdminAuthWrapper] Admin 존재:', adminExists);
        console.log('[AdminAuthWrapper] Hospital 정보:', hospital);
        console.log('[AdminAuthWrapper] hasClinic:', hasClinic);

        if (!adminExists) {
          throw new Error('Admin account not found');
        }

        if (hospital?.id_uuid_admin) {
          const { setAlarmInfo } = useAlarmStore.getState();
          setAlarmInfo({ id_uuid_hospital: hospital.id_uuid_admin });
        }

        if (mounted) {
          const hasInfo = Boolean(hospital) || hasClinic;
          console.log('[AdminAuthWrapper] hasClinicInfo 설정:', hasInfo);
          setHasClinicInfo(hasInfo);
        }
      } catch (error) {
        console.error('[AdminAuthWrapper] ❌ Admin status check error:', error);
        if (mounted) {
          router.push('/admin/login');
        }
      }
    };

    if (!sessionLoading) {
      checkAdminStatus();
    }

    return () => {
      mounted = false;
    };
  }, [user, sessionLoading, router]);

  if (sessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (sessionError || !user) {
    router.push('/admin/login');
    return null;
  }




  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          관리자 페이지
        </h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">안녕하세요!</p>
          <p className="text-sm text-gray-500">{userEmail.split('@')[0]} 님</p>
        </div>

        <AdminPageClient hasClinicInfo={hasClinicInfo} />
      </div>
    </div>
  );
} 
