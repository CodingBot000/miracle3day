"use client";

import * as React from "react";
import AttendanceMonthlyGrid from "./AttendanceMonthlyGrid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type MonthResp = { ym: string; attendedDays: number[] };

function toYM(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function AttendanceModalButton() {
  const today = new Date();
  const [open, setOpen] = React.useState(false);
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1);
  const [attendedDays, setAttendedDays] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = React.useState<boolean | null>(null);

  // 컴포넌트 마운트 시 오늘 출석 상태 확인
  React.useEffect(() => {
    void checkTodayAttendance();
  }, []);

  // 모달 열릴 때 현재 월 로드
  React.useEffect(() => {
    if (!open) return;
    void fetchMonth(new Date(year, month - 1, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function checkTodayAttendance() {
    try {
      const ym = toYM(today);
      const res = await fetch(`/api/attendance?ym=${ym}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch today's attendance");
      const data: MonthResp = await res.json();
      const todayDay = today.getDate();
      setHasCheckedInToday(data.attendedDays.includes(todayDay));
    } catch (e) {
      console.error(e);
      setHasCheckedInToday(false);
    }
  }

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
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tz }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.was_already) {
      setAttendedDays((prev) =>
        prev.includes(data.day) ? prev : [...prev, data.day].sort((a, b) => a - b)
      );
      // 오늘 체크인한 경우 버튼 상태 업데이트
      const todayDay = today.getDate();
      if (data.day === todayDay) {
        setHasCheckedInToday(true);
      }
    }
    return !data.was_already;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white transition-colors ${
          hasCheckedInToday === true
            ? "bg-green-600 hover:bg-green-700"
            : hasCheckedInToday === false
            ? "bg-black hover:bg-black/90"
            : "bg-gray-400 cursor-not-allowed"
        }`}>
          {hasCheckedInToday === null ? "Loading..." : hasCheckedInToday ? "✓ Checked In" : "Check In"}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Daily Check-in</DialogTitle>
        </DialogHeader>

        {loading && <p className="text-xs text-gray-500">Syncing…</p>}

        <AttendanceMonthlyGrid
          year={year}
          month={month}
          attendedDays={attendedDays}
          onCheckIn={handleCheckIn}
          disableFuture
          allowRecheck={false}
        />

        <div className="mt-2 text-xs text-gray-500">
          Check in daily and collect +10 points! Don’t miss out!
        </div>
      </DialogContent>
    </Dialog>
  );
}
