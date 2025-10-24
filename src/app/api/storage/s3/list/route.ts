import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/s3';

export const runtime = 'nodejs';

const BUCKET = process.env.LIGHTSAIL_BUCKET_NAME;

export async function GET(req: NextRequest) {
  try {
    if (!BUCKET) {
      return NextResponse.json({ error: 'Bucket configuration missing' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get('bucket')?.replace(/^\//, '').replace(/\/+$/, '');
    const prefixParam = searchParams.get('prefix');

    if (!bucket || prefixParam === null) {
      return NextResponse.json({ error: 'bucket and prefix required' }, { status: 400 });
    }

    const normalizedPrefix = prefixParam.replace(/^\/+/, '');
    const keyPrefix = [bucket, normalizedPrefix].filter(Boolean).join('/').replace(/\/+/g, '/');
    const prefixWithSlash = keyPrefix.endsWith('/') ? keyPrefix : `${keyPrefix}/`;

    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefixWithSlash,
    });

    const output = await s3.send(command);
    const data = (output.Contents || []).map((obj) => ({
      name: obj.Key?.split('/').pop(),
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('list error:', error);
    const message = error instanceof Error ? error.message : 'list failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
