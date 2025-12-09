'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ClinicInfoInsertClient from './ClinicInfoInsertClient';
import { useFormMode } from '@/contexts/admin/FormModeContext';

export default function ClinicInfoUploadClientWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);
  const [id_admin, setid_admin] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);

  const { user, isLoading: authLoading, error: authError } = useAuth();

  useEffect(() => {
    // Auth가 로딩 중이 아닐 때만 체크
    if (!authLoading) {
      checkAuthAndSetup();
    }
  }, [user, authLoading]);

  const checkAuthAndSetup = async () => {
    try {
      console.log('[UploadWrapper] 인증 확인 시작');
      console.log('[UploadWrapper] authLoading:', authLoading);
      console.log('[UploadWrapper] user:', user);
      console.log('[UploadWrapper] authError:', authError);

      // Auth 에러가 있거나 로딩 완료 후에도 user가 없으면 로그인으로
      if (authError || (!authLoading && !user)) {
        console.log('[UploadWrapper] ❌ 인증되지 않은 사용자 - 로그인 페이지로 이동');
        router.push('/admin/login');
        return;
      }

      // 아직 로딩 중이면 대기
      if (authLoading) {
        console.log('[UploadWrapper] ⏳ 인증 정보 로딩 중...');
        return;
      }

      // User가 있으면 정상 처리
      if (user) {
        console.log('[UploadWrapper] ✅ 인증된 사용자:', {
          id: user.id,
          email: user.email,
          id_uuid_hospital: user.id_uuid_hospital
        });

        setid_admin(user.id.toString());

        // 편집 모드 확인
        const mode = searchParams.get('mode');
        const editMode = mode === 'edit';
        setIsEditMode(editMode);
        console.log('[UploadWrapper] 페이지 모드:', editMode ? '편집' : '신규등록');

        // 인증 완료
        setIsReady(true);
      }
    } catch (error) {
      console.error('[UploadWrapper] ❌ 인증 확인 중 오류:', error);
      router.push('/admin/login');
    }
  };

  // 로딩 중이거나 준비가 안됐으면 로딩 스피너
  if (authLoading || !isReady) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
      </div>
    );
  }

  return (
    <ClinicInfoInsertClient
      id_admin={id_admin as string}
      isEditMode={isEditMode}
    />
  );
}
