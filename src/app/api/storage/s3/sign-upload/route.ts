import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/s3';

export const runtime = 'nodejs';

const BUCKET = process.env.LIGHTSAIL_BUCKET_NAME;

type SignUploadRequest = {
  bucket: string;
  key: string;
  contentType?: string;
  upsert?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    if (!BUCKET) {
      return NextResponse.json({ error: 'Bucket configuration missing' }, { status: 500 });
    }

    const body = (await req.json()) as SignUploadRequest;
    const bucket = body.bucket?.replace(/^\//, '').replace(/\/+$/, '');
    const key = body.key?.replace(/^\/+/, '');

    if (!bucket || !key) {
      return NextResponse.json({ error: 'bucket and key required' }, { status: 400 });
    }

    const objectKey = `${bucket}/${key}`.replace(/\/+/g, '/');

    if (!body.upsert) {
      try {
        await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: objectKey }));
        return NextResponse.json({ error: 'object exists' }, { status: 409 });
      } catch (error: any) {
        const statusCode = error?.$metadata?.httpStatusCode;
        if (statusCode && statusCode !== 404) {
          throw error;
        }
      }
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: objectKey,
      ContentType: body.contentType || 'application/octet-stream',
      ACL: 'public-read',
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('sign-upload error:', error);
    const message = error instanceof Error ? error.message : 'sign failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
