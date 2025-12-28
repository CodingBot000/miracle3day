// Fitzpatrick Type 1-6
export type FitzpatrickType = 1 | 2 | 3 | 4 | 5 | 6;

// RGB 색상값
export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

// 선택 결과
export interface FitzpatrickResult {
  type: FitzpatrickType;
  method: 'photo' | 'manual'; // 어떤 방법으로 선택했는지
  rgb?: RGB; // photo 방식일 때만
  timestamp: string; // ISO 날짜
}

// 컬러 칩 데이터
export interface ColorChipData {
  type: FitzpatrickType;
  label: {
    ko: string;
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
  color: string; // HEX 색상
}

// 선택된 지점 (사진 방식)
export interface SelectedPoint {
  x: number;
  y: number;
  rgb: RGB;
  fitzpatrickType: FitzpatrickType;
}

// 컴포넌트 Props
export interface FitzpatrickSelectorProps {
  /** 선택 완료 콜백 */
  onSelect: (result: FitzpatrickResult) => void;
  /** 건너뛰기 콜백 (optional) */
  onSkip?: () => void;
  /** 현재 선택된 값 (편집 모드용) */
  initialValue?: FitzpatrickType;
  /** 언어 */
  locale: 'ko' | 'en';
  /** 건너뛰기 버튼 표시 여부 */
  showSkip?: boolean;
  /** 임베디드 모드 (헤더 숨김 등) */
  embedded?: boolean;
  /** 클래스명 */
  className?: string;
}

// 하위 컴포넌트 Props
export interface PhotoMethodProps {
  onSelect: (result: FitzpatrickResult) => void;
  onBack: () => void;
  locale: 'ko' | 'en';
}

export interface ManualMethodProps {
  onSelect: (result: FitzpatrickResult) => void;
  onBack?: () => void;
  initialValue?: FitzpatrickType;
  locale: 'ko' | 'en';
}

export interface ColorChipProps {
  chip: ColorChipData;
  selected: boolean;
  onClick: () => void;
  locale: 'ko' | 'en';
}
