// src/utils/imageCompression.ts
import imageCompression, {
  Options as ImageCompressionOptions,
} from "browser-image-compression";

export type ImageCompressionType =
  | "profile"
  | "review"
  | "community_posting"
  | "thumbnail"
  | "clinic_display"
  | "doctor";

export interface ImageCompressionConfig extends ImageCompressionOptions {
  timeoutMs: number;
}

/**
 * 타입별 기본 압축 설정
 * - maxSizeMB: 목표 최대 용량(MB)
 * - maxWidthOrHeight: 긴 변 기준 리사이즈(px)
 * - timeoutMs: 압축 타임아웃(ms)
 *
 * 필요에 따라 숫자는 조정 가능
 */
const IMAGE_COMPRESSION_CONFIG: Record<ImageCompressionType, ImageCompressionConfig> = {
  profile: {
    maxSizeMB: 0.2,          // 200KB 정도
    maxWidthOrHeight: 400,   // 프로필은 작게
    useWebWorker: true,
    timeoutMs: 10000,
  },
  review: {
    maxSizeMB: 1.0,          // 리뷰: 품질 유지 최대한 + 1MB 목표
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    timeoutMs: 15000,
  },
  community_posting: {
    maxSizeMB: 1.0,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    timeoutMs: 15000,
  },
  thumbnail: {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 600,
    useWebWorker: true,
    timeoutMs: 10000,
  },
  clinic_display: {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    timeoutMs: 20000,
  },
  doctor: {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    timeoutMs: 12000,
  },
};

/**
 * 커스텀 에러 타입
 */
export class ImageCompressionTimeoutError extends Error {
  constructor(message = "Image compression timeout") {
    super(message);
    this.name = "ImageCompressionTimeoutError";
  }
}

export class ImageCompressionError extends Error {
  fileName?: string;

  constructor(message: string, fileName?: string) {
    super(message);
    this.name = "ImageCompressionError";
    this.fileName = fileName;
  }
}

export interface SingleCompressionResult {
  originalFile: File;
  compressedFile: File;
  type: ImageCompressionType;
}

export interface MultipleCompressionResult {
  results: SingleCompressionResult[];
  errors: (ImageCompressionError | ImageCompressionTimeoutError)[];
}

/**
 * Promise에 타임아웃을 거는 헬퍼
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ImageCompressionTimeoutError());
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * 단일 파일 압축
 */
export async function compressSingleImage(
  file: File,
  type: ImageCompressionType,
  overrideOptions?: Partial<ImageCompressionConfig>
): Promise<SingleCompressionResult> {
  const baseConfig = IMAGE_COMPRESSION_CONFIG[type];
  const config: ImageCompressionConfig = {
    ...baseConfig,
    ...overrideOptions,
  };

  const { timeoutMs, ...compressionOptions } = config;

  try {
    const compressedBlob = await withTimeout(
      imageCompression(file, compressionOptions),
      timeoutMs
    );

    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type || file.type,
      lastModified: Date.now(),
    });

    return {
      originalFile: file,
      compressedFile,
      type,
    };
  } catch (error: any) {
    if (error instanceof ImageCompressionTimeoutError) {
      throw error;
    }
    throw new ImageCompressionError(
      error?.message || "Image compression failed",
      file.name
    );
  }
}

/**
 * 복수 파일 압축
 * - 각 파일마다 독립적으로 압축 및 에러/타임아웃 처리
 * - 전체 진행이 끝난 뒤 결과/에러 배열 반환
 */
export async function compressMultipleImages(
  files: File[],
  type: ImageCompressionType,
  overrideOptions?: Partial<ImageCompressionConfig>
): Promise<MultipleCompressionResult> {
  const tasks = files.map((file) =>
    compressSingleImage(file, type, overrideOptions)
      .then((result) => ({ status: "fulfilled" as const, result }))
      .catch((error) => ({ status: "rejected" as const, error }))
  );

  const settled = await Promise.all(tasks);

  const results: SingleCompressionResult[] = [];
  const errors: (ImageCompressionError | ImageCompressionTimeoutError)[] = [];

  for (const item of settled) {
    if (item.status === "fulfilled") {
      results.push(item.result);
    } else if (item.status === "rejected") {
      if (item.error instanceof ImageCompressionTimeoutError) {
        errors.push(item.error);
      } else if (item.error instanceof ImageCompressionError) {
        errors.push(item.error);
      } else {
        errors.push(
          new ImageCompressionError(
            item.error?.message || "Unknown compression error"
          )
        );
      }
    }
  }

  return { results, errors };
}

/**
 * 타입별 기본 설정을 외부에서 참고하고 싶을 때 사용
 */
export function getImageCompressionConfig(type: ImageCompressionType) {
  return IMAGE_COMPRESSION_CONFIG[type];
}
