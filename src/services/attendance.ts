export type MonthResp = { ym: string; attendedDays: number[] };

export function toYM(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function fetchAttendanceMonth(ymDate: Date): Promise<MonthResp> {
  const ym = toYM(ymDate);
  const res = await fetch(`/api/attendance?ym=${ym}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch month");
  return res.json();
}

export async function checkTodayAttendance(): Promise<boolean> {
  const today = new Date();
  const ym = toYM(today);
  const res = await fetch(`/api/attendance?ym=${ym}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch today's attendance");
  const data: MonthResp = await res.json();
  const todayDay = today.getDate();
  return data.attendedDays.includes(todayDay);
}

export async function submitCheckIn(): Promise<{ was_already: boolean; day: number }> {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const res = await fetch("/api/attendance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tz }),
  });
  if (!res.ok) throw new Error("Failed to check in");
  return res.json();
}

export async function fetchPoint(): Promise<number> {
  const res = await fetch("/api/point", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch point");
  return res.json();
}