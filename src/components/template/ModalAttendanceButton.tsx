"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AttendanceCalendar from "./AttendanceCalendar";
import { handleNotifications } from '@/utils/notificationHandler';
import LevelUpModal from '@/components/gamification/LevelUpModal';
import type { LevelUpNotification } from '@/types/badge';

type MonthResp = { ym: string; attendedDays: number[] };

function toYM(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function ModalAttendanceButton() {
  const today = new Date();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1); // 1~12
  const [attendedDays, setAttendedDays] = React.useState<number[]>([]);
  const [levelUp, setLevelUp] = React.useState<LevelUpNotification | null>(null);

  // 모달이 열릴 때 현재 달 데이터 로딩
  React.useEffect(() => {
    if (!open) return;
    fetchMonth(new Date(year, month - 1, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function fetchMonth(ymDate: Date) {
    setLoading(true);
    try {
      const ym = toYM(ymDate);
      const res = await fetch(`/api/attendance?ym=${ym}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data: MonthResp = await res.json();
      const parts = data.ym.split("-");
      setYear(Number(parts[0]));
      setMonth(Number(parts[1]));
      setAttendedDays(data.attendedDays);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleMonthChange(ymDate: Date) {
    await fetchMonth(ymDate);
  }

  async function handleCheckIn(date: Date) {
    // 클라이언트 타임존 전달 → 로컬 자정 기준 처리
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tz }),
    });
    if (!res.ok) return false;

    const data = await res.json(); // { ym, day, was_already, points_awarded, attended_today, notifications }
    if (!data.was_already) {
      // optimistic 갱신 또는 서버 재조회
      setAttendedDays((prev) =>
        prev.includes(data.day) ? prev : [...prev, data.day].sort((a, b) => a - b)
      );

      // Handle badge notifications
      if (data.notifications) {
        const levelUpNotification = handleNotifications(data.notifications);
        if (levelUpNotification) {
          setLevelUp(levelUpNotification);
        }
      }
    }
    return !data.was_already;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white hover:bg-black/90">
          Check In
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Daily Check-in</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <AttendanceCalendar
            year={year}
            month={month}
            attendedDays={attendedDays}
            loading={loading}
            onMonthChange={handleMonthChange}
            onCheckIn={handleCheckIn}
            disableFuture
            allowRecheck={false}
          />
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Check in daily and collect +10 points! Don&apos;t miss out!
        </div>
      </DialogContent>

      {/* Level-up modal */}
      {levelUp && (
        <LevelUpModal
          level={levelUp.level}
          exp={levelUp.exp}
          onClose={() => setLevelUp(null)}
        />
      )}
    </Dialog>
  );
}
