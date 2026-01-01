import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

    // 4. Query parameters 추출
    const searchParams = request.nextUrl.searchParams;
    const bucket = searchParams.get('bucket');
    const key = searchParams.get('key');

    if (!bucket || !key) {
      return NextResponse.json(
        { error: 'Bucket and key parameters are required' },
        { status: 400 }
      );
    }

    // 5. Presigned URL 생성 (5분 만료)
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return NextResponse.json({ url });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
