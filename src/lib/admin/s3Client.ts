import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  DeleteObjectsCommandInput,
  ListObjectsV2CommandInput,
  HeadObjectCommandInput
} from '@aws-sdk/client-s3';

// Lightsail Object Storage 설정 (S3 호환)
const BUCKET_NAME = process.env.LIGHTSAIL_BUCKET_NAME || 'beauty-bucket-public';

// ⚠️ LIGHTSAIL_ENDPOINT에서 버킷 이름 제거
const rawEndpoint = process.env.LIGHTSAIL_ENDPOINT || 'https://s3.us-west-2.amazonaws.com';

// endpoint에서 버킷 이름이 포함되어 있으면 제거
const cleanEndpoint = rawEndpoint.replace(`${BUCKET_NAME}.`, '');

const s3Client = new S3Client({
  region: process.env.LIGHTSAIL_REGION || 'us-west-2',
  endpoint: cleanEndpoint,
  credentials: {
    accessKeyId: process.env.LIGHTSAIL_ACCESS_KEY!,
    secretAccessKey: process.env.LIGHTSAIL_SECRET_KEY!,
  },
  // ✅ endpoint에 버킷 이름 없이, virtual-hosted-style 사용
  forcePathStyle: false,
});

/**
 * 파일 업로드
 * @param key - S3 객체 키 (파일 경로)
 * @param body - 파일 내용 (Buffer 또는 ReadableStream)
 * @param contentType - MIME 타입
 * @param options - 추가 옵션
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | ReadableStream,
  contentType?: string,
  options?: {
    cacheControl?: string;
    metadata?: Record<string, string>;
  }
) {
  const params: PutObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: options?.cacheControl || '3600',
    Metadata: options?.metadata,
  };

  const command = new PutObjectCommand(params);
  const result = await s3Client.send(command);

  // 공개 URL 생성
  const publicUrl = `${process.env.LIGHTSAIL_ENDPOINT}/${key}`;

  return {
    success: true,
    url: publicUrl,
    etag: result.ETag,
    versionId: result.VersionId,
  };
}

/**
 * 파일 삭제
 * @param key - S3 객체 키 (파일 경로)
 */
export async function deleteFile(key: string) {
  const params: DeleteObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);
  const result = await s3Client.send(command);

  return {
    success: true,
    deleted: result.DeleteMarker,
    versionId: result.VersionId,
  };
}

/**
 * 여러 파일 일괄 삭제
 * @param keys - 삭제할 파일 경로 배열
 */
export async function deleteFiles(keys: string[]) {
  if (keys.length === 0) {
    return { success: true, deleted: [] };
  }

  const params: DeleteObjectsCommandInput = {
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: keys.map(key => ({ Key: key })),
      Quiet: false,
    },
  };

  const command = new DeleteObjectsCommand(params);
  const result = await s3Client.send(command);

  return {
    success: true,
    deleted: result.Deleted || [],
    errors: result.Errors || [],
  };
}

/**
 * 디렉토리 내 파일 목록 조회
 * @param prefix - 디렉토리 경로 (예: "images/hospitalimg/uuid/")
 * @param maxKeys - 최대 조회 개수
 */
export async function listFiles(prefix: string, maxKeys: number = 1000) {
  const params: ListObjectsV2CommandInput = {
    Bucket: BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: maxKeys,
  };

  const command = new ListObjectsV2Command(params);
  const result = await s3Client.send(command);

  const files = (result.Contents || []).map(item => ({
    key: item.Key!,
    name: item.Key!.split('/').pop() || '',
    size: item.Size || 0,
    lastModified: item.LastModified,
    etag: item.ETag,
  }));

  return {
    success: true,
    files,
    count: result.KeyCount || 0,
    isTruncated: result.IsTruncated || false,
  };
}

/**
 * 파일 존재 여부 확인
 * @param key - S3 객체 키 (파일 경로)
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const params: HeadObjectCommandInput = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new HeadObjectCommand(params);
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * 공개 URL 생성
 * @param key - S3 객체 키 (파일 경로)
 */
export function getPublicUrl(key: string): string {
  return `${process.env.LIGHTSAIL_ENDPOINT}/${key}`;
}

/**
 * S3 키에서 파일명 추출
 * @param key - S3 객체 키
 */
export function extractFileName(key: string): string {
  return key.split('/').pop() || '';
}

/**
 * URL에서 S3 키 추출
 * @param url - 전체 URL
 */
export function extractKeyFromUrl(url: string): string {
  const endpoint = process.env.LIGHTSAIL_ENDPOINT || '';
  if (url.startsWith(endpoint)) {
    return url.replace(`${endpoint}/`, '');
  }

  // 다른 형태의 URL 처리
  const urlParts = url.split('/');
  const imagesIndex = urlParts.indexOf('images');
  if (imagesIndex !== -1) {
    return urlParts.slice(imagesIndex).join('/');
  }

  return url;
}

export { s3Client, BUCKET_NAME };
