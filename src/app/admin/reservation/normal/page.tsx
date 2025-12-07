import { getReservationDatas } from '@/app/api/admin/reservation';
import ReservationClient from './ReservationClient';

import { redirect } from 'next/navigation';
// import { ROUTE } from '@/router';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReservationPage({ params }: PageProps) {
  // Next.js 15에서 params는 Promise 타입
  const resolvedParams = await params;
  
  // 서버에서 사용자 정보 가져오기
//   const userData = await getUserAPI();
    const reservaltionData = await getReservationDatas(resolvedParams.id);
//   console.log("ReservationPage server userData:", userData);
  
  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
//   if (!userData) {
//     redirect(`${ROUTE.LOGIN}?redirect=/hospital/${resolvedParams.id}/reservation`);
//   }
  
  return <ReservationClient initialReservationData={reservaltionData} hospitalId={resolvedParams.id} />;
}