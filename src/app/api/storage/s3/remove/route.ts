import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/s3';

export const runtime = 'nodejs';

const BUCKET = process.env.LIGHTSAIL_BUCKET_NAME;

type RemoveRequest = {
  bucket: string;
  paths: string[];
};

export async function POST(req: NextRequest) {
  try {
    if (!BUCKET) {
      return NextResponse.json({ error: 'Bucket configuration missing' }, { status: 500 });
    }

    const body = (await req.json()) as RemoveRequest;
    const bucket = body.bucket?.replace(/^\//, '').replace(/\/+$/, '');
    const paths = Array.isArray(body.paths) ? body.paths : [];

    if (!bucket || paths.length === 0) {
      return NextResponse.json({ error: 'bucket and paths required' }, { status: 400 });
    }

    const Objects = paths.map((p) => ({
      Key: `${bucket}/${p}`.replace(/\/+/g, '/'),
    }));

    const command = new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects },
    });

    const result = await s3.send(command);

    if (result?.Errors && result.Errors.length > 0) {
      return NextResponse.json({ error: result.Errors }, { status: 500 });
    }

    return NextResponse.json({ data: true });
  } catch (error) {
    console.error('remove error:', error);
    const message = error instanceof Error ? error.message : 'remove failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
