import { NextRequest, NextResponse } from 'next/server';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth/jwt';
import { pool } from '@/lib/db';
import { s3Client } from '@/lib/s3';

export async function GET(request: NextRequest) {
  try {
    // 1. JWT 세션 확인
    const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 어드민 조회
    const { rows: adminRows } = await pool.query(
      `SELECT id_uuid_hospital, email FROM admin WHERE id_uuid_hospital = $1`,
      [payload.sub]
    );

    if (adminRows.length === 0) {
      return NextResponse.json(
        { error: 'Admin account not found' },
        { status: 400 }
      );
    }

    // 3. 슈퍼어드민 체크
    const admin = adminRows[0];
    const isSuperAdmin = admin.email === process.env.SUPER_ADMIN_EMAIL;

    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }

    // 4. Lightsail 버킷 목록 조회
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    const buckets = response.Buckets?.map((bucket) => ({
      name: bucket.Name || '',
      creationDate: bucket.CreationDate?.toISOString() || '',
    })) || [];

    return NextResponse.json({ buckets });

  } catch (error) {
    console.error('Error fetching buckets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buckets' },
      { status: 500 }
    );
  }
}
