import { NextRequest, NextResponse } from 'next/server';
import { deleteFile, deleteFiles } from '@/lib/s3';

/**
 * DELETE /api/storage/delete - S3 파일 삭제
 * Body: { key: string } 또는 { keys: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, keys } = body;

    if (!key && (!keys || keys.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Key or keys required' },
        { status: 400 }
      );
    }

    let result;

    if (keys && Array.isArray(keys)) {
      // 여러 파일 삭제
      result = await deleteFiles(keys);
    } else if (key) {
      // 단일 파일 삭제
      result = await deleteFile(key);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('S3 delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
