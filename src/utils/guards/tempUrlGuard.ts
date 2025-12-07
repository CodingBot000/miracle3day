/**
 * temp_url 방어 유틸리티
 *
 * temp_url_* 상태의 이미지가 DB에 저장되지 않도록 방어합니다.
 */

/**
 * 배열에 temp_url로 시작하는 항목이 있는지 확인
 */
export function hasTempUrls(arr: unknown): boolean {
  if (!Array.isArray(arr)) return false;
  return arr.some(v => typeof v === 'string' && v.startsWith('temp_url_'));
}

/**
 * temp_url로 시작하는 항목을 배열에서 제거
 */
export function filterOutTempUrls(arr: string[]): string[] {
  return arr.filter(v => !(typeof v === 'string' && v.startsWith('temp_url_')));
}
