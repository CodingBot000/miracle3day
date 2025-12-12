'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useStreamUnreadCount } from '@/hooks/useStreamUnreadCount';

interface AdminPageClientProps {
  hasClinicInfo: boolean;
}


export default function AdminPageClient({
  hasClinicInfo,
}: AdminPageClientProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { totalUnreadCount } = useStreamUnreadCount();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      getCurrentUser();
    }
  }, [user]);

  const getCurrentUser = async () => {
    try {
      if (user?.email) {
        const username = user.email.split('@')[0];
        console.log('username:', username);
        setCurrentUser(username);

        // 슈퍼관리자 확인
        setIsSuperAdmin(user.email === process.env.SUPER_ADMIN_EMAIL);
        console.log('[AdminPageClient] 슈퍼관리자 여부:', user.email === process.env.SUPER_ADMIN_EMAIL);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const handleNavigateToUpload = () => {
    const url = hasClinicInfo
      ? '/admin/upload?mode=edit'
      : '/admin/upload';
    router.push(url);
  };

  const handleManageAdminAccount = () => {
    router.push('/admin/manage-admin-account');
  }

  const handleSupportTreatmentInput = () => {
    // router.push('/admin/support-treatment-input');
    router.push('/admin/products/input');
  };
  const handleReservationDashBoard = () => {
    router.push('/admin/reservation/normal');
  };

  const handleReservationVideoConsultDashBoard = () => {
    router.push('/admin/reservation/video_consult');
  };

  const handleConsultationSubmissions = () => {
    router.push('/admin/consultation');
  };

  const handleChatMessages = () => {
    router.push('/admin/chat');
  };

  const handleCreateAccount = () => {
    router.push('/admin/create-account');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className='flex flex-col gap-4'>
      <button
        onClick={handleNavigateToUpload}
        className="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 border-2 border-black bg-white text-black hover:bg-gray-100"
      >
        {hasClinicInfo
          ? '병원정보보기'
          : '* 병원정보입력하기 *(필수)'}
      </button>

      <button
        onClick={handleManageAdminAccount}
        disabled={!hasClinicInfo}
        className="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 border-2 border-black bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {hasClinicInfo
          ? '관리자계정관리 및 시작화면관리'
          : '(병원정보 입력 후 이용 가능)관리자계정관리 및 시작화면관리'}
      </button>    
      
      <button
        onClick={handleSupportTreatmentInput}
        disabled={!hasClinicInfo}
        className="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 border-2 border-black bg-white text-black hover:bg-gray-100"
      >
        상품 정보 입력 하기 (제공 시술 정보 입력)
{/* /Users/switch/Documents/웹개발요청/complete/beauty-main/src/app/hospital/[id]/reservation/ReservationClient.tsx */}
      </button>

      <button
        onClick={handleReservationDashBoard}
        disabled={!hasClinicInfo}
        className="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 border-2 border-black bg-white text-black hover:bg-gray-100"
      >
        예약정보 보기
{/* /Users/switch/Documents/웹개발요청/complete/beauty-main/src/app/hospital/[id]/reservation/ReservationClient.tsx */}
      </button>
      <button
        onClick={handleReservationVideoConsultDashBoard}
        disabled={!hasClinicInfo}
        className="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 border-2 border-black bg-white text-black hover:bg-gray-100"
      >
        화상상담 예약정보 보기

      </button>


      <button
        onClick={handleChatMessages}
        disabled={!hasClinicInfo}
        className="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 border-2 border-black bg-white text-black hover:bg-gray-100 relative"
      >
        <span className="flex items-center justify-center gap-2">
          <span>환자 문의 채팅</span>
          {totalUnreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
              {totalUnreadCount}
            </span>
          )}
        </span>
      </button>

      {currentUser === process.env.NEXT_PUBLIC_SUPER_ADMIN! && (
        <button
          onClick={handleConsultationSubmissions}
          disabled={!hasClinicInfo}
          className="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 border-2 border-black bg-white text-black hover:bg-gray-100"
        >
          문진표 요청 조회하기
        </button>
      )}

      {isSuperAdmin && (
        <button
          onClick={handleCreateAccount}
          className="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 border-2 border-black bg-white text-black hover:bg-gray-100"
        >
          병원 계정 신규 발급
        </button>
      )}

      <button
        onClick={handleLogout}
        className='w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200'
      >
        로그아웃
      </button>
    </div>
  );
}
