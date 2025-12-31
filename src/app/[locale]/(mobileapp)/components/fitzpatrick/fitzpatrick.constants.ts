import type { ColorChipData } from './fitzpatrick.types';

// Fitzpatrick Type별 컬러 칩 데이터
export const FITZPATRICK_COLOR_CHIPS: ColorChipData[] = [
  {
    type: 1,
    label: { ko: 'Fair', en: 'Fair' },
    description: {
      ko: '매우 밝음, 쉽게 탐',
      en: 'Very fair, always burns',
    },
    color: '#FFEEE6', // 매우 밝은 피치톤
  },
  {
    type: 2,
    label: { ko: 'Light', en: 'Light' },
    description: {
      ko: '밝음, 자주 탐',
      en: 'Fair, burns easily',
    },
    color: '#F5D6C6', // 밝은 베이지
  },
  {
    type: 3,
    label: { ko: 'Medium', en: 'Medium' },
    description: {
      ko: '중간, 가끔 탐',
      en: 'Medium, sometimes burns',
    },
    color: '#E8C4A8', // 중간 베이지
  },
  {
    type: 4,
    label: { ko: 'Tan', en: 'Tan' },
    description: {
      ko: '올리브톤, 거의 안 탐',
      en: 'Olive, rarely burns',
    },
    color: '#C8A282', // 올리브 탄
  },
  {
    type: 5,
    label: { ko: 'Brown', en: 'Brown' },
    description: {
      ko: '갈색, 안 탐',
      en: 'Brown, very rarely burns',
    },
    color: '#A67C52', // 브라운
  },
  {
    type: 6,
    label: { ko: 'Deep', en: 'Deep' },
    description: {
      ko: '매우 어두움',
      en: 'Very dark, never burns',
    },
    color: '#6B4423', // 딥 브라운
  },
];

// ITA (Individual Typology Angle) 기준값
export const ITA_THRESHOLDS = {
  TYPE_1: 55, // ITA > 55
  TYPE_2: 41, // ITA > 41
  TYPE_3: 28, // ITA > 28
  TYPE_4: 10, // ITA > 10
  TYPE_5: -30, // ITA > -30
  // TYPE_6: ITA <= -30
} as const;

// UI 텍스트
export const FITZPATRICK_TEXTS = {
  title: {
    ko: '햇볕에 대한 피부 반응을 알려주세요',
    en: 'Tell us about your sun sensitivity',
  },
  subtitle: {
  ko: '피부 타입에 맞는 맞춤 루틴 구성 및 추천에 사용돼요',
  en: 'Used to build a personalized routine for your skin',
  },
  photoMethod: {
    label: {
      ko: '📷 사진으로 확인하기',
      en: '📷 Scan with photo',
    },
    description: {
      ko: '정확하고 재미있는 방법이에요!',
      en: 'Accurate and fun!',
    },
  },
  manualMethod: {
    label: {
      ko: '직접 선택하기',
      en: 'Select manually',
    },
  },
  skip: {
    ko: '건너뛰기',
    en: 'Skip',
  },
  back: {
    ko: '← 뒤로',
    en: '← Back',
  },
  confirm: {
    ko: '확인',
    en: 'Confirm',
  },
  retry: {
    ko: '다시 선택',
    en: 'Try again',
  },
  photoTips: {
    title: {
      ko: '📸 촬영 팁',
      en: '📸 Photo tips',
    },
    tips: {
      ko: [
        '밝은 자연광 아래에서 촬영하세요',
        '실내 형광등은 피해주세요',
        '손등을 화면 중앙에 놓으세요',
      ],
      en: [
        'Take photo in natural daylight',
        'Avoid indoor fluorescent lights',
        'Center your hand in the frame',
      ],
    },
  },
  captureButton: {
    ko: '📷 손등 사진 촬영',
    en: '📷 Take photo of hand',
  },
  touchPrompt: {
    ko: '피부 부분을 터치해주세요',
    en: 'Touch your skin area',
  },
  touchTip: {
    ko: '💡 평평하고 그림자 없는 부분을 선택하세요',
    en: '💡 Select a flat area without shadows',
  },
  confirmPrompt: {
    ko: '이 톤이 맞나요?',
    en: 'Is this your skin tone?',
  },
  confirmYes: {
    ko: '예, 맞아요',
    en: 'Yes, correct',
  },
  confirmNo: {
    ko: '다시 선택',
    en: 'Select again',
  },
  switchToManual: {
    ko: '직접 선택하기',
    en: 'Select manually',
  },
} as const;
