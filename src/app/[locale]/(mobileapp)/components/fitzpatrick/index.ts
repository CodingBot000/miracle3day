// 메인 컴포넌트
export { default as FitzpatrickSelector } from './FitzpatrickSelector';

// 하위 컴포넌트 (필요시 개별 사용)
export { default as PhotoMethod } from './PhotoMethod';
export { default as ManualMethod } from './ManualMethod';
export { default as ColorChip } from './ColorChip';

// 타입
export type {
  FitzpatrickType,
  FitzpatrickResult,
  FitzpatrickSelectorProps,
  RGB,
  ColorChipData,
  SelectedPoint,
} from './fitzpatrick.types';

// 유틸리티
export {
  rgbToFitzpatrick,
  getPixelColor,
  rgbToHex,
  getSunSensitivityLevel,
} from './fitzpatrick.utils';

// 상수
export {
  FITZPATRICK_COLOR_CHIPS,
  FITZPATRICK_TEXTS,
} from './fitzpatrick.constants';
