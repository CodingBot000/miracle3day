"use client";

import * as React from "react";
import AttendanceMonthlyGrid from "./AttendanceMonthlyGrid";

type MonthResp = { ym: string; attendedDays: number[] };

function toYM(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function AttendanceSection() {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1);
  const [attendedDays, setAttendedDays] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // 첫 렌더 시 현재 월 데이터 로드
    void fetchMonth(new Date(year, month - 1, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMonth(ymDate: Date) {
    setLoading(true);
    try {
      const ym = toYM(ymDate);
      const res = await fetch(`/api/attendance?ym=${ym}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch month");
      const data: MonthResp = await res.json();
      const [y, m] = data.ym.split("-").map(Number);
      setYear(y);
      setMonth(m);
      setAttendedDays(data.attendedDays);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn(date: Date) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await fetch("/api/attendance/check_in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tz }),
    });
    if (!res.ok) return false;
    const data = await res.json(); // { ym, day, was_already, points_awarded, ... }

    if (!data.was_already) {
      // Optimistic 반영
      setAttendedDays((prev) =>
        prev.includes(data.day) ? prev : [...prev, data.day].sort((a, b) => a - b)
      );
    }
    return !data.was_already;
  }

  return (
    <section className="mx-auto max-w-md">
      <h2 className="mb-2 text-xl font-semibold">Daily Check-in</h2>
      {loading && <p className="mb-2 text-xs text-gray-500">Loading…</p>}

      <AttendanceMonthlyGrid
        year={year}
        month={month}
        attendedDays={attendedDays}
        onCheckIn={handleCheckIn}
        disableFuture
        allowRecheck={false}
      />

      {/* 월 이동이 필요하면 AttendanceMonthlyGrid 내부의 화살표 버튼을 사용하세요. */}
    </section>
  );
}
