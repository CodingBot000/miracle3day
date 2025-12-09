import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/admin/s3Client';

/**
 * POST /api/storage/upload - S3 파일 업로드
 * FormData: file, key, contentType
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const key = formData.get('key') as string;
    const contentType = formData.get('contentType') as string | undefined;

    if (!file || !key) {
      return NextResponse.json(
        { success: false, error: 'File and key required' },
        { status: 400 }
      );
    }

    // File을 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadFile(
      key,
      buffer,
      contentType || file.type,
      {
        cacheControl: '3600',
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('S3 upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
