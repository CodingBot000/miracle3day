import { NextResponse } from 'next/server';
import { readAccessToken, readAdminSession } from '@/lib/auth/jwt';
import { pool } from '@/lib/db';
import { generateAdminToken } from '@/lib/stream/adminToken';

/**
 * Generate Stream Chat token for authenticated hospital admin
 * GET /api/admin/stream/token
 */
export async function GET() {
  console.log('[API /admin/stream/token] Stream token generation request');

  // 1. Check session (support both new JWT and old admin session)
  const accessToken = await readAccessToken();
  const oldAdminSession = await readAdminSession();
  const session = accessToken || oldAdminSession;

  if (!session) {
    console.log('[API /admin/stream/token] ❌ No session - 401');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[API /admin/stream/token] Session type:', accessToken ? 'JWT' : 'Legacy');

  // 2. Get hospital info from admin table
  try {
    const { rows } = await pool.query(
      `SELECT id, email, id_uuid_hospital FROM admin WHERE id = $1`,
      [session.sub]
    );

    console.log('[API /admin/stream/token] DB query result:', rows);

    if (rows.length === 0) {
      console.log('[API /admin/stream/token] ❌ Admin user not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const admin = rows[0];
    const hospitalId = admin.id_uuid_hospital;

    if (!hospitalId) {
      console.log('[API /admin/stream/token] ❌ No hospital UUID for this admin');
      return NextResponse.json(
        { error: 'No hospital associated with this account' },
        { status: 400 }
      );
    }

    // 3. Get hospital name
    const { rows: hospitalRows } = await pool.query(
      `SELECT name_en, name FROM hospital WHERE id_uuid = $1`,
      [hospitalId]
    );

    const hospitalName =
      hospitalRows.length > 0
        ? hospitalRows[0].name_en || hospitalRows[0].name || 'Hospital'
        : 'Hospital';

    console.log('[API /admin/stream/token] Hospital name:', hospitalName);

    // 4. Generate Stream token
    const tokenData = await generateAdminToken(hospitalId, hospitalName);

    console.log('[API /admin/stream/token] ✅ Token generated successfully');

    return NextResponse.json({
      success: true,
      token: tokenData.token,
      apiKey: tokenData.apiKey,
      hospitalId: tokenData.hospitalId,
      hospitalName,
    });
  } catch (error) {
    console.error('[API /admin/stream/token] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
