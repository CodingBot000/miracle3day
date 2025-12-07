import { NextRequest, NextResponse } from 'next/server';
import { listFiles } from '@/lib/admin/s3Client';
import { log } from "@/utils/logger";
/**
 * POST /api/storage/list - S3 파일 목록 조회
 * Body: { prefix: string, maxKeys?: number }
 */
export async function POST(request: NextRequest) {
  let prefix = '';
  try {
    const body = await request.json();
    prefix = body.prefix;
    const maxKeys = body.maxKeys;

    if (!prefix) {
      return NextResponse.json(
        { success: false, error: 'Prefix is required' },
        { status: 400 }
      );
    }

    const result = await listFiles(prefix, maxKeys);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('S3 list files error:', error);

    // NoSuchKey 또는 폴더/파일이 없는 경우 빈 배열 반환
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      log.info('파일/폴더가 존재하지 않음 - 빈 배열 반환:', prefix);
      return NextResponse.json({
        success: true,
        files: [],
        count: 0,
        isTruncated: false,
      });
    }

    // 그 외의 에러는 500으로 처리
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
