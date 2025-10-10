
export type TooltipKey = 'primary' | 'alternative' | 'combo';

type TooltipEntry = {
  title: string;            // 툴팁 제목(선택)
  summary: string;          // 두괄식 한 줄
  detail: string;           // 상세 설명(여러 줄 가능)
  examples?: string[];      // 예시 문구 배열(선택)
};

type LocaleCode = 'en' | 'ko' /* | 'ja' | 'zh' ... */;
type TooltipDict = Record<TooltipKey, TooltipEntry>;

export const tooltips: Record<LocaleCode, TooltipDict> = {
  en: {
    primary: {
      title: 'Primary Treatment',
      summary: 'The most standard, widely used option for this concern.',
      detail:
        'A primary treatment is the main, clinically proven solution commonly chosen first. It generally offers a strong balance of efficacy and safety.',
      examples: ['Forehead lines → Botox', 'Skin laxity → Ultherapy / Thermage'],
    },
    alternative: {
      title: 'Alternative / Complementary',
      summary: 'Options to replace or support the primary treatment.',
      detail:
        '“Alternative” provides a similar outcome with a different method. “Complementary” fills what the primary cannot fully address (e.g., volume, texture).',
      examples: ['After Botox, add filler for deep grooves', 'Combine toning with gentle fractional for texture'],
    },
    combo: {
      title: 'Recommended Combination',
      summary: 'Pairing treatments to boost synergy and longevity.',
      detail:
        'By addressing multiple layers (skin, muscle, fat) together, combinations can improve overall results and durability. Avoid stacking the same energy type too often.',
      examples: ['Ultherapy → Botox → Filler (sequence over weeks)'],
    },
  },
  ko: {
    primary: {
      title: '대표 시술',
      summary: '해당 고민에 가장 표준적이고 널리 쓰이는 기본 선택입니다.',
      detail:
        '대표 시술은 임상적으로 효과와 안전성이 검증되어 대다수가 먼저 고려하는 메인 솔루션을 뜻합니다.',
      examples: ['이마 주름 → 보톡스', '피부 처짐 → 울쎄라 / 써마지'],
    },
    alternative: {
      title: '대체/보완 시술',
      summary: '대표 시술을 대신하거나 함께 보완하는 선택지입니다.',
      detail:
        '“대체”는 다른 원리로 비슷한 효과를 내고, “보완”은 대표 시술로 부족한 부분(예: 볼륨·결)을 채웁니다.',
      examples: ['보톡스 후 깊은 홈은 필러로 보완', '토닝에 미세 프락셔널을 더해 결 개선'],
    },
    combo: {
      title: '보완(병합) 권장',
      summary: '함께 진행하면 시너지와 유지력이 높아집니다.',
      detail:
        '피부·근육·지방 등 여러 층위를 함께 다루면 전반적인 만족도가 올라갑니다. 다만 같은 에너지 계열을 과도하게 겹치는 것은 피하세요.',
      examples: ['울쎄라 → 보톡스 → 필러(수주 간격)'],
    },
  },
} as const;

export function tTooltip(locale: LocaleCode, key: TooltipKey): TooltipEntry {
  const fallback: LocaleCode = 'en';
  return tooltips[locale]?.[key] ?? tooltips[fallback][key];
}
