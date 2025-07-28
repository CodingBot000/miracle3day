import { getUserAPI } from '@/app/api/auth/getUser';
import ReservationClient from './ReservationClient';
import { redirect } from 'next/navigation';
import { ROUTE } from '@/router';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ReservationPage({ params }: PageProps) {
  // 서버에서 사용자 정보 가져오기
  const userData = await getUserAPI();
  
  console.log("ReservationPage server userData:", userData);
  
  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  if (!userData) {
    redirect(`${ROUTE.LOGIN}?redirect=/hospital/${params.id}/reservation`);
  }
  
  return <ReservationClient initialUserData={userData} hospitalId={params.id} />;
}