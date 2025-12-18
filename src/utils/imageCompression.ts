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

// Result 패턴: 성공 케이스
export interface SingleCompressionSuccess {
  success: true;
  originalFile: File;
  compressedFile: File;
  type: ImageCompressionType;
  error: null;
}

// Result 패턴: 실패 케이스
export interface SingleCompressionFailure {
  success: false;
  originalFile: File;
  compressedFile: null;
  type: ImageCompressionType;
  error: ImageCompressionError | ImageCompressionTimeoutError;
}

// Result 패턴: Union 타입
export type SingleCompressionResult = SingleCompressionSuccess | SingleCompressionFailure;

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
 * 단일 파일 압축 (Result 패턴)
 * @returns success가 true면 압축 성공, false면 실패 (error 포함)
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
      success: true,
      originalFile: file,
      compressedFile,
      type,
      error: null,
    };
  } catch (error: any) {
    let compressionError: ImageCompressionError | ImageCompressionTimeoutError;

    if (error instanceof ImageCompressionTimeoutError) {
      compressionError = error;
    } else if (error instanceof ImageCompressionError) {
      compressionError = error;
    } else {
      compressionError = new ImageCompressionError(
        error?.message || "Image compression failed",
        file.name
      );
    }

    return {
      success: false,
      originalFile: file,
      compressedFile: null,
      type,
      error: compressionError,
    };
  }
}

/**
 * 복수 파일 압축 (Result 패턴)
 * - 각 파일마다 독립적으로 압축
 * - 전체 진행이 끝난 뒤 결과/에러 배열 반환
 */
export async function compressMultipleImages(
  files: File[],
  type: ImageCompressionType,
  overrideOptions?: Partial<ImageCompressionConfig>
): Promise<MultipleCompressionResult> {
  // 모든 파일을 병렬로 압축 (Result 패턴이므로 예외가 발생하지 않음)
  const allResults = await Promise.all(
    files.map((file) => compressSingleImage(file, type, overrideOptions))
  );

  const results: SingleCompressionResult[] = [];
  const errors: (ImageCompressionError | ImageCompressionTimeoutError)[] = [];

  // 성공/실패를 분리
  for (const result of allResults) {
    results.push(result);
    if (!result.success) {
      errors.push(result.error);
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
