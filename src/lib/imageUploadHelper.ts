/**
 * Unified Image Upload Helper
 *
 * Provides a standardized way to upload images with:
 * - Automatic compression based on type
 * - Presigned URL approach for direct S3 uploads
 * - Automatic retry logic with exponential backoff
 * - Progress tracking support
 * - Filename sanitization
 *
 * @example
 * ```typescript
 * const result = await uploadImageWithCompression(file, {
 *   compressionType: 'review',
 *   bucket: 'consultation_photos',
 *   folder: 'user-uploads',
 * });
 *
 * // Save to DB
 * await saveToDatabase({ imagePath: result.s3Path });
 * ```
 */

import {
  compressSingleImage,
  compressMultipleImages,
  ImageCompressionType,
  ImageCompressionConfig
} from '@/utils/imageCompression';

// ============================================================================
// Types
// ============================================================================

export interface ImageUploadOptions {
  // Core options
  compressionType: ImageCompressionType;
  bucket: string;
  folder: string;

  // Optional overrides
  compressionOverride?: Partial<ImageCompressionConfig>;
  upsert?: boolean;
  generateFileName?: (originalName: string, index?: number) => string;

  // Callbacks
  onProgress?: (progress: UploadProgress) => void;
  onFileStart?: (file: File, index: number) => void;
  onFileComplete?: (result: SingleUploadResult) => void;
  onFileError?: (file: File, error: Error) => void;
}

export interface UploadProgress {
  fileIndex: number;
  fileName: string;
  stage: 'compressing' | 'requesting-url' | 'uploading' | 'complete' | 'error';
  progress: number; // 0-100
}

export interface SingleUploadResult {
  originalFile: File;
  compressedFile: File;
  s3Key: string;
  s3Path: string;
  publicUrl?: string;
  compressionRatio: number;
}

export interface BatchUploadResult {
  successful: SingleUploadResult[];
  failed: UploadFailure[];
  totalTime: number;
}

export interface UploadFailure {
  file: File;
  error: Error;
  stage: 'compression' | 'presign' | 'upload';
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Upload single image with compression
 *
 * @param file - File to upload
 * @param options - Upload configuration
 * @returns Upload result with S3 path
 *
 * @throws {Error} If compression fails (bad file)
 * @throws {Error} If upload fails after retries
 */
export async function uploadImageWithCompression(
  file: File,
  options: ImageUploadOptions
): Promise<SingleUploadResult> {
  const startTime = Date.now();

  // Report compression start
  options.onProgress?.({
    fileIndex: 0,
    fileName: file.name,
    stage: 'compressing',
    progress: 0
  });

  try {
    // Step 1: Compress image (Result 패턴)
    const compressionResult = await compressSingleImage(
      file,
      options.compressionType,
      options.compressionOverride
    );

    if (!compressionResult.success) {
      throw new Error(`Compression failed: ${compressionResult.error.message}`);
    }

    const compressedFile = compressionResult.compressedFile;
    const compressionRatio = file.size / compressedFile.size;

    // Step 2: Sanitize filename
    const safeFileName = options.generateFileName
      ? options.generateFileName(file.name, 0)
      : sanitizeFileName(file.name);

    // Step 3: Generate S3 key
    const s3Key = `${options.bucket}/${options.folder}/${safeFileName}`.replace(/\/+/g, '/');

    // Report presign start
    options.onProgress?.({
      fileIndex: 0,
      fileName: file.name,
      stage: 'requesting-url',
      progress: 30
    });

    // Step 4: Request presigned URL
    const presignedUrl = await requestPresignedUrl(
      options.bucket,
      `${options.folder}/${safeFileName}`,
      compressedFile.type,
      options.upsert ?? false
    );

    // Report upload start
    options.onProgress?.({
      fileIndex: 0,
      fileName: file.name,
      stage: 'uploading',
      progress: 40
    });

    // Step 5: Upload to S3 with retry
    await uploadToS3WithRetry(
      presignedUrl,
      compressedFile,
      compressedFile.type,
      (percent) => {
        options.onProgress?.({
          fileIndex: 0,
          fileName: file.name,
          stage: 'uploading',
          progress: 40 + (percent * 0.6) // 40-100%
        });
      },
      3 // max retries
    );

    // Report complete
    options.onProgress?.({
      fileIndex: 0,
      fileName: file.name,
      stage: 'complete',
      progress: 100
    });

    const result: SingleUploadResult = {
      originalFile: file,
      compressedFile,
      s3Key,
      s3Path: s3Key, // Same for now, can be customized
      compressionRatio
    };

    options.onFileComplete?.(result);

    return result;

  } catch (error) {
    options.onProgress?.({
      fileIndex: 0,
      fileName: file.name,
      stage: 'error',
      progress: 0
    });

    options.onFileError?.(file, error as Error);

    throw error;
  }
}

/**
 * Upload multiple images in parallel with concurrency limit
 *
 * @param files - Files to upload
 * @param options - Upload configuration
 * @param maxConcurrent - Maximum concurrent uploads (default: 3)
 * @returns Batch upload result
 */
export async function uploadMultipleImages(
  files: File[],
  options: ImageUploadOptions,
  maxConcurrent: number = 3
): Promise<BatchUploadResult> {
  const startTime = Date.now();
  const successful: SingleUploadResult[] = [];
  const failed: UploadFailure[] = [];

  // Create upload tasks
  const tasks = files.map((file, index) => async () => {
    try {
      options.onFileStart?.(file, index);

      // Create options for this file
      const fileOptions: ImageUploadOptions = {
        ...options,
        onProgress: options.onProgress ? (progress) => {
          options.onProgress?.({
            ...progress,
            fileIndex: index,
          });
        } : undefined,
      };

      const result = await uploadImageWithCompression(file, fileOptions);
      successful.push(result);

    } catch (error) {
      failed.push({
        file,
        error: error as Error,
        stage: 'upload', // Default to upload stage
      });
    }
  });

  // Execute with concurrency limit
  await executeConcurrently(tasks, maxConcurrent);

  return {
    successful,
    failed,
    totalTime: Date.now() - startTime
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Sanitize filename (remove Korean/special chars, keep only alphanumeric + . - _)
 *
 * @param fileName - Original filename
 * @returns Sanitized filename
 *
 * @example
 * sanitizeFileName("안녕하세요 사진.jpg") // → "___.jpg"
 * sanitizeFileName("photo-123.png") // → "photo-123.png"
 */
function sanitizeFileName(fileName: string): string {
  if (!fileName) return 'file';

  // Split into name and extension
  const lastDotIndex = fileName.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName;
  const ext = lastDotIndex !== -1 ? fileName.slice(lastDotIndex) : '';

  // Sanitize name: keep only alphanumeric, dot, dash, underscore
  const safeName = name
    .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_')            // Replace consecutive underscores with single
    .replace(/^[._-]+/, '')            // Remove leading dots, underscores, dashes
    .replace(/[._-]+$/, '')            // Remove trailing dots, underscores, dashes
    || 'file';                         // Fallback if name becomes empty

  // Sanitize extension
  const safeExt = ext
    .replace(/[^a-zA-Z0-9.]/g, '')
    .toLowerCase();

  return safeName + safeExt;
}

/**
 * Request presigned URL from /api/storage/s3/sign-upload
 *
 * @param bucket - S3 bucket name (folder within main bucket)
 * @param key - S3 key (path within bucket)
 * @param contentType - File MIME type
 * @param upsert - Allow overwriting existing files
 * @returns Presigned URL
 *
 * @throws {Error} If API request fails
 */
async function requestPresignedUrl(
  bucket: string,
  key: string,
  contentType: string,
  upsert: boolean
): Promise<string> {
  const response = await fetch('/api/storage/s3/sign-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bucket,
      key,
      contentType,
      upsert
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));

    if (response.status === 409) {
      throw new Error('File already exists. Use upsert: true to overwrite.');
    }

    throw new Error(`Failed to get presigned URL: ${error.error || response.statusText}`);
  }

  const data = await response.json();

  if (!data?.url) {
    throw new Error('Invalid response: missing URL');
  }

  return data.url;
}

/**
 * Upload file to S3 using presigned URL with retry logic
 *
 * @param presignedUrl - Presigned URL from sign-upload API
 * @param file - File to upload
 * @param contentType - File MIME type
 * @param onProgress - Progress callback (0-100)
 * @param maxRetries - Maximum retry attempts (default: 3)
 *
 * @throws {Error} If upload fails after all retries
 */
async function uploadToS3WithRetry(
  presignedUrl: string,
  file: File,
  contentType: string,
  onProgress?: (percent: number) => void,
  maxRetries: number = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Progress tracking
        if (onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percent = (e.loaded / e.total) * 100;
              onProgress(percent);
            }
          });
        }

        // Success
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`S3 upload failed with status ${xhr.status}`));
          }
        });

        // Error
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        // Timeout
        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timeout'));
        });

        // Configure and send
        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.timeout = 60000; // 60 seconds
        xhr.send(file);
      });

      // Success - exit retry loop
      return;

    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(
    `Upload failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Execute tasks with concurrency limit
 *
 * @param tasks - Array of async tasks
 * @param maxConcurrent - Maximum concurrent tasks
 */
async function executeConcurrently<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrent: number
): Promise<void> {
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const promise = task().then(() => {
      executing.splice(executing.indexOf(promise), 1);
    });

    executing.push(promise);

    if (executing.length >= maxConcurrent) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
}

// ============================================================================
// Exports
// ============================================================================

export {
  sanitizeFileName,
  requestPresignedUrl,
  uploadToS3WithRetry,
};
