import type { RGB, FitzpatrickType } from './fitzpatrick.types';
import { ITA_THRESHOLDS } from './fitzpatrick.constants';

/**
 * RGB 값을 Fitzpatrick Skin Type으로 변환
 * Individual Typology Angle (ITA) 방식 사용
 *
 * @param rgb - RGB 색상값
 * @param adjustForHand - 손등→얼굴 보정 적용 여부 (기본: true)
 * @returns Fitzpatrick Type (1-6)
 */
export function rgbToFitzpatrick(
  rgb: RGB,
  adjustForHand: boolean = true
): FitzpatrickType {
  let { r, g, b } = rgb;

  // 손등 → 얼굴 보정 (손등이 보통 약간 더 어두움)
  if (adjustForHand) {
    r = Math.min(255, r + 5);
    g = Math.min(255, g + 5);
    b = Math.min(255, b + 5);
  }

  // Luminance 계산 (밝기)
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Brightness 계산
  const brightness = Math.sqrt((r * r + g * g + b * b) / 3);

  // ITA (Individual Typology Angle) 계산
  // 0으로 나누기 방지
  const ITA =
    brightness > 0 ? Math.atan((L - 50) / brightness) * (180 / Math.PI) : 0;

  // ITA 값에 따른 Fitzpatrick Type 분류
  if (ITA > ITA_THRESHOLDS.TYPE_1) return 1;
  if (ITA > ITA_THRESHOLDS.TYPE_2) return 2;
  if (ITA > ITA_THRESHOLDS.TYPE_3) return 3;
  if (ITA > ITA_THRESHOLDS.TYPE_4) return 4;
  if (ITA > ITA_THRESHOLDS.TYPE_5) return 5;
  return 6;
}

/**
 * Canvas에서 특정 좌표의 RGB 값 추출
 *
 * @param canvas - HTMLCanvasElement
 * @param x - X 좌표
 * @param y - Y 좌표
 * @returns RGB 값 또는 null
 */
export function getPixelColor(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
): RGB | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  try {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return {
      r: pixel[0],
      g: pixel[1],
      b: pixel[2],
    };
  } catch (error) {
    console.error('Failed to get pixel color:', error);
    return null;
  }
}

/**
 * RGB를 HEX 색상으로 변환
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * 이미지 파일을 Canvas에 로드
 *
 * @param canvas - HTMLCanvasElement
 * @param file - 이미지 파일
 * @param maxWidth - 최대 너비 (성능 최적화)
 * @returns Promise<void>
 */
export function loadImageToCanvas(
  canvas: HTMLCanvasElement,
  file: File,
  maxWidth: number = 800
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // 이미지 리사이징 (성능 최적화)
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(url);
      resolve();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Canvas 터치/클릭 이벤트에서 좌표 계산
 *
 * @param canvas - HTMLCanvasElement
 * @param event - MouseEvent 또는 TouchEvent
 * @returns { x, y } 좌표
 */
export function getCanvasCoordinates(
  canvas: HTMLCanvasElement,
  event: MouseEvent | TouchEvent
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();

  // Touch 이벤트 처리
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

  // Canvas 내부 좌표로 변환 (스케일 고려)
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: Math.round((clientX - rect.left) * scaleX),
    y: Math.round((clientY - rect.top) * scaleY),
  };
}

/**
 * Fitzpatrick Type에 따른 자외선 민감도 레벨 반환
 */
export function getSunSensitivityLevel(
  type: FitzpatrickType
): 'very_high' | 'high' | 'moderate' | 'low' {
  switch (type) {
    case 1:
      return 'very_high';
    case 2:
      return 'high';
    case 3:
    case 4:
      return 'moderate';
    case 5:
    case 6:
      return 'low';
  }
}

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // 파일 타입 체크
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: '이미지 파일만 업로드 가능합니다' };
  }

  // 파일 크기 체크 (10MB 제한)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '파일 크기는 10MB 이하여야 합니다' };
  }

  return { valid: true };
}
