export function formatISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getCurrentMonthKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatKoreanDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 · ${weekday}요일`;
}
