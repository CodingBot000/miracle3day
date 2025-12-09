import { VideoConsultReservationAdminPage } from './VideoConsultReservationAdminPage';
import { cookies } from 'next/headers';
import { readSession } from '@/lib/admin/auth';
import { pool } from '@/lib/db';
import { TABLE_ADMIN } from '@/constants/tables';

export default async function Page() {
  // Get base URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Get session cookie for server-side request
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('bl_admin_session');

  // Check if user is SUPER_ADMIN
  let isSuperAdmin = false;
  const session = await readSession();
  if (session && session.sub) {
    const { rows: adminRows } = await pool.query(
      `SELECT email FROM ${TABLE_ADMIN} WHERE id = $1`,
      [session.sub]
    );
    if (adminRows.length > 0) {
      const admin = adminRows[0];
      isSuperAdmin = admin.email === process.env.SUPER_ADMIN_EMAIL;
    }
  }

  // Fetch initial data (first page)
  const res = await fetch(
    `${baseUrl}/api/admin/video-reservations?page=1&pageSize=20`,
    {
      cache: 'no-store',
      headers: {
        Cookie: sessionCookie ? `bl_admin_session=${sessionCookie.value}` : '',
      },
    }
  );

  let initialData = null;
  if (res.ok) {
    initialData = await res.json();
  }

  return <VideoConsultReservationAdminPage initialData={initialData} isSuperAdmin={isSuperAdmin} />;
}
