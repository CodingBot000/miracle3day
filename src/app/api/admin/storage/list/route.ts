import { NextRequest, NextResponse } from 'next/server';
import {
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
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
    const prefix = searchParams.get('prefix') || '';

    if (!bucket) {
      return NextResponse.json(
        { error: 'Bucket parameter is required' },
        { status: 400 }
      );
    }

    // 5. Lightsail 리스팅
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: '/', // 폴더 구분자
    });

    const response: ListObjectsV2CommandOutput = await s3Client.send(command);

    // 6. 폴더 목록 (CommonPrefixes)
    const folders = response.CommonPrefixes?.map((cp) => ({
      type: 'folder' as const,
      key: cp.Prefix || '',
      name: cp.Prefix?.replace(prefix, '').replace('/', '') || '',
    })) || [];

    // 7. 파일 목록 (Contents)
    const files = response.Contents?.filter((obj) => obj.Key !== prefix) // 현재 폴더 자체는 제외
      .map((obj) => ({
        type: 'file' as const,
        key: obj.Key || '',
        name: obj.Key?.replace(prefix, '') || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString() || '',
      })) || [];

    return NextResponse.json({
      bucket,
      prefix,
      folders,
      files,
    });

  } catch (error) {
    console.error('Error listing objects:', error);
    return NextResponse.json(
      { error: 'Failed to list objects' },
      { status: 500 }
    );
  }
}
