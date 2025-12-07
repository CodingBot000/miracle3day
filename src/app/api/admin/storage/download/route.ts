import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '@/lib/admin/s3Client';
import { log } from "@/utils/logger";
/**
 * POST /api/storage/download - S3 파일 다운로드
 * Body: { key: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'File key is required' },
        { status: 400 }
      );
    }

    log.info('S3 파일 다운로드 요청:', key);

    // S3에서 파일 가져오기
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    // Stream을 Buffer로 변환
    const chunks: Uint8Array[] = [];
    if (response.Body) {
      // @ts-expect-error - Body is a readable stream
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
    }
    const buffer = Buffer.concat(chunks);

    // 파일명 추출
    const fileName = key.split('/').pop() || 'download';

    // Content-Type 결정
    const contentType = response.ContentType || 'application/octet-stream';

    // 파일 다운로드 응답 반환
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('S3 파일 다운로드 오류:', error);

    // 파일이 없는 경우
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // 기타 오류
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
