'use client';

import OverflowFixer from '@/components/utils/OverflowFixer';
import { useReservationRealtime } from '@/hooks/useReservationRealtime';
import Providers from '@/provider/QueryProvider';
import { useAlarmStore } from '@/stores/useHospitalUUIDStore';
import { Toaster } from 'sonner';

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { info } = useAlarmStore();
  const hospitalId = info?.id_uuid_hospital;

  useReservationRealtime(hospitalId || '');

  return (
    <Providers>
      <OverflowFixer />
      {children}
      <Toaster richColors position="top-center" duration={1500} />
    </Providers>
  );
}
