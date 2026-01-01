import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/jwt';
import { pool } from '@/lib/db';
import StorageExplorer from './components/StorageExplorer';

export default async function StoragePage() {
  // 1. JWT 세션 확인
  const session = await getSessionUser();

  if (!session) {
    redirect('/admin/login');
  }

  // 2. 어드민 조회
  const { rows: adminRows } = await pool.query(
    `SELECT id_uuid_hospital, email FROM admin WHERE id_uuid_hospital = $1`,
    [session.id]
  );

  if (adminRows.length === 0) {
    redirect('/admin/login');
  }

  // 3. 슈퍼어드민 체크
  const admin = adminRows[0];
  const isSuperAdmin = admin.email === process.env.SUPER_ADMIN_EMAIL;

  if (!isSuperAdmin) {
    // 슈퍼어드민이 아니면 접근 거부
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            접근 거부
          </h1>
          <p className="text-gray-700 mb-4">
            이 페이지는 슈퍼어드민만 접근할 수 있습니다.
          </p>
          <a
            href="/admin"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            관리자 홈으로
          </a>
        </div>
      </div>
    );
  }

  // 4. 슈퍼어드민이면 StorageExplorer 렌더링
  return <StorageExplorer />;
}
