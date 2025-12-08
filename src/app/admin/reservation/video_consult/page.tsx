import { VideoConsultReservationAdminPage } from './VideoConsultReservationAdminPage';
import { cookies } from 'next/headers';

export default async function Page() {
  // Get base URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Get session cookie for server-side request
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('bl_admin_session');

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

  return <VideoConsultReservationAdminPage initialData={initialData} />;
}
