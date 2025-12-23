'use client';

import { log } from '@/utils/logger';
import ReservationClient from './ReservationClient';
import { useRouter } from 'next/navigation';
import { ROUTE } from '@/router';
import { useEffect, useState } from 'react';
import { UserOutputDto } from '@/app/api/auth/getUser/getUser.dto';
import { HospitalDetailMainOutput } from '@/app/api/hospital/[id]/main/main.dto';
import { getHospitalMainAPI } from '@/app/api/hospital/[id]/main';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ReservationPage({ params }: PageProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserOutputDto | null>(null);
  const [hospitalData, setHospitalData] = useState<HospitalDetailMainOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data via API route
        const userRes = await fetch('/api/auth/getUser');
        if (!userRes.ok || userRes.status === 401) {
          log.debug('[ReservationPage] User not authenticated, redirecting to login');
          router.replace(`${ROUTE.LOGIN}?redirect=/hospital/${params.id}/reservation`);
          return;
        }

        const userJson = await userRes.json();
        if (!userJson.userInfo) {
          log.debug('[ReservationPage] No user info, redirecting to login');
          router.replace(`${ROUTE.LOGIN}?redirect=/hospital/${params.id}/reservation`);
          return;
        }

        setUserData(userJson);

        // Fetch hospital data
        const hospital = await getHospitalMainAPI({ id: params.id });
        setHospitalData(hospital);

        log.debug('[ReservationPage] Data loaded:', { userJson, hospital });
      } catch (error) {
        log.error('[ReservationPage] Error fetching data:', error);
        router.replace(`${ROUTE.LOGIN}?redirect=/hospital/${params.id}/reservation`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData || !hospitalData) {
    return null; // Will redirect in useEffect
  }

  return (
    <ReservationClient
      initialUserData={userData}
      hospitalId={params.id}
      hospitalData={hospitalData}
    />
  );
}
