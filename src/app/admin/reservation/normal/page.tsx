import { getReservationDatas } from '@/app/api/admin/reservation';
import ReservationClient from './ReservationClient';
import { redirect } from 'next/navigation';
import { readSession } from '@/lib/admin/auth';
import { pool } from '@/lib/db';
import { TABLE_ADMIN } from '@/constants/tables';

export default async function ReservationPage() {
  // Get session
  const session = await readSession();

  // If no session, redirect to login
  if (!session || !session.sub) {
    redirect('/admin/login');
  }

  // Get admin info from database to find hospital ID
  const adminId = session.sub.toString();
  const { rows: adminRows } = await pool.query(
    `SELECT id, email, id_uuid_hospital FROM ${TABLE_ADMIN} WHERE id = $1`,
    [adminId]
  );

  const admin = adminRows[0];

  // If admin not found or no hospital ID, show error
  if (!admin || !admin.id_uuid_hospital) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">병원 정보를 찾을 수 없습니다</h1>
          <p className="text-gray-600">먼저 병원 정보를 입력해주세요.</p>
        </div>
      </div>
    );
  }

  // Fetch reservation data using hospital ID from admin
  const reservationData = await getReservationDatas(admin.id_uuid_hospital);

  return <ReservationClient initialReservationData={reservationData} hospitalId={admin.id_uuid_hospital} />;
}