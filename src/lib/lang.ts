export function normalizeLang(input?: string | null): string {
  if (!input) return '';
  return input.toLowerCase().replace('_', '-').split('-')[0]; // en-US -> en
}

// 현재 사이트 언어를 받아서(예: 'ko-KR') 2글자 기준으로.
export function pickTargetLang(uiLang?: string | null, fallback = 'en') {
  const n = normalizeLang(uiLang);
  return n || fallback;
}
