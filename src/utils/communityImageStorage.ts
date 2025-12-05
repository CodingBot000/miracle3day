import { s3 } from '@/lib/s3';
import { PutObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.LIGHTSAIL_BUCKET_NAME!;
const REGION = process.env.LIGHTSAIL_REGION || 'us-west-2';
const BASE_PATH = 'community/posts';

/**
 * Generate image path for community post
 */
export function generateImagePath(postId: number, index: number, extension: string): string {
  const timestamp = Date.now();
  return `${BASE_PATH}/${postId}/${index + 1}_${timestamp}.${extension}`;
}

/**
 * Get public URL from path (server-side)
 */
export function getImageUrl(path: string): string {
  const bucket = BUCKET_NAME || 'beauty-bucket-public';
  const region = REGION || 'us-west-2';
  return `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
}

/**
 * Convert path to URL (alias for getImageUrl)
 */
export function pathToUrl(path: string): string {
  return getImageUrl(path);
}

/**
 * Upload single image to S3 and return full public URL
 */
export async function uploadImage(
  postId: number,
  file: Buffer,
  index: number,
  mimeType: string
): Promise<string> {
  const extension = mimeType.split('/')[1] || 'jpg';
  const path = generateImagePath(postId, index, extension);

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
    Body: file,
    ContentType: mimeType,
  }));

  // Return full public URL (like profile images)
  return getImageUrl(path);
}

/**
 * Extract S3 key from URL or return path as-is
 */
function extractKeyFromUrlOrPath(urlOrPath: string): string {
  // If it's a full URL, extract the key (path after bucket name)
  const urlPattern = /^https?:\/\/[^\/]+\.s3\.[^\/]+\.amazonaws\.com\/(.+)$/;
  const match = urlOrPath.match(urlPattern);
  if (match) {
    return match[1];
  }
  // Otherwise return as-is (it's already a path)
  return urlOrPath;
}

/**
 * Delete all images for a post
 */
export async function deleteAllPostImages(postId: number): Promise<void> {
  const prefix = `${BASE_PATH}/${postId}/`;

  const listResponse = await s3.send(new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  }));

  if (!listResponse.Contents || listResponse.Contents.length === 0) {
    return;
  }

  await s3.send(new DeleteObjectsCommand({
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: listResponse.Contents.map(obj => ({ Key: obj.Key! })),
    },
  }));
}

/**
 * Delete specific images by URL or path
 */
export async function deleteImages(urlsOrPaths: string[]): Promise<void> {
  if (urlsOrPaths.length === 0) return;

  const keys = urlsOrPaths.map(extractKeyFromUrlOrPath);

  await s3.send(new DeleteObjectsCommand({
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: keys.map(key => ({ Key: key })),
    },
  }));
}
