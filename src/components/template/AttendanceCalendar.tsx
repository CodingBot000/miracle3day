"use client";

/* eslint-disable react/prop-types */
import * as React from "react";
import { DayPicker, DayProps } from "react-day-picker";
import "react-day-picker/dist/style.css"; // ✅ 기본 스타일 불러오기 (필수)

type AttendanceCalendarProps = {
  year: number;              // ex) 2025
  month: number;             // 1~12
  attendedDays: number[];    // [1..31]
  onCheckIn?: (date: Date) => Promise<boolean> | boolean;
  onMonthChange?: (ym: Date) => void | Promise<void>;
  disableFuture?: boolean;   // default: true
  allowRecheck?: boolean;    // default: false
  loading?: boolean;
  className?: string;
};

// ===== Utils =====
function toDate(year: number, month1to12: number, day1to31: number) {
  return new Date(year, month1to12 - 1, day1to31);
}
function getMonthFirst(year: number, month1to12: number) {
  return new Date(year, month1to12 - 1, 1);
}

export default function AttendanceCalendar({
  year,
  month,
  attendedDays,
  onCheckIn,
  onMonthChange,
  disableFuture = true,
  allowRecheck = false,
  loading = false,
  className,
}: AttendanceCalendarProps) {
  const [viewYM, setViewYM] = React.useState<Date>(getMonthFirst(year, month));
  const [attended, setAttended] = React.useState<Set<number>>(new Set(attendedDays));
  const [pendingDay, setPendingDay] = React.useState<number | null>(null);

  React.useEffect(() => {
    setViewYM(getMonthFirst(year, month));
  }, [year, month]);

  React.useEffect(() => {
    setAttended(new Set(attendedDays));
  }, [attendedDays]);

  const handleMonthChange = async (m: Date) => {
    const first = getMonthFirst(m.getFullYear(), m.getMonth() + 1);
    setViewYM(first);
    await onMonthChange?.(first);
  };

  const handleDayClick = async (date: Date) => {
    // 미래 클릭 막기
    if (disableFuture) {
      const today = new Date();
      const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      if (d0 > t0) return;
    }

    const d = date.getDate();
    if (!allowRecheck && attended.has(d)) return;

    setPendingDay(d);
    let ok = true;
    try {
      if (onCheckIn) ok = !!(await onCheckIn(date));
    } catch {
      ok = false;
    } finally {
      setPendingDay(null);
    }
    if (ok) setAttended(prev => new Set(prev).add(d));
  };

  const attendedDates = React.useMemo(
    () => Array.from(attended).map(d => toDate(viewYM.getFullYear(), viewYM.getMonth() + 1, d)),
    [attended, viewYM]
  );

  const today = new Date();

  return (
    <div className={`w-full max-w-md mx-auto ${className ?? ""}`} style={{ minWidth: 320 }}>
      {/* 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-semibold">
          {viewYM.getFullYear()}년 {viewYM.getMonth() + 1}월
        </div>
        {loading && <div className="text-xs text-gray-500 animate-pulse">Syncing…</div>}
      </div>

      <DayPicker
        month={viewYM}
        showOutsideDays
        captionLayout="label"
        onMonthChange={handleMonthChange}
        onDayClick={handleDayClick}
        // ✅ 테이블 레이아웃을 유지해야 합니다. (row/head_row에 grid 금지)
        classNames={{
          months: "rdp-months w-full",               // 기본 table 사용
          month: "rdp-month w-full",
          caption: "rdp-caption flex items-center justify-between mb-2",
          caption_label: "text-base font-semibold",
          nav: "rdp-nav flex items-center gap-2",
          nav_button: "rdp-navbtn p-2 rounded-md hover:bg-gray-100",
          table: "rdp-table w-full border-collapse table-fixed",
          head: "rdp-head border-b",
          head_row: "rdp-head_row",                  // ❌ grid 쓰지 않음
          head_cell: "rdp-head_cell p-2 text-center text-sm font-semibold text-gray-600",
          tbody: "rdp-tbody",
          row: "rdp-row",                             // ❌ grid 쓰지 않음
          cell: "rdp-cell p-1 text-center align-middle",
          day: "rdp-day",                             // 기본 day 버튼은 아래 components.Day에서 대체
        }}
        modifiers={{
          attended: attendedDates,
          today: today,
          pending: pendingDay
            ? [toDate(viewYM.getFullYear(), viewYM.getMonth() + 1, pendingDay)]
            : [],
        }}
        modifiersClassNames={{
          attended: "bg-green-50",
          pending: "bg-green-100/50",
          today: "font-semibold text-blue-600",
        }}
        components={{
          Day: (props) => {
            // ✅ date 얻기 (v8/v9 호환)
            const date: Date =
            // @ts-expect-error - some versions expose date directly
            props.date ??
            props.day?.date;

            // ✅ modifiers 접근 (객체 형태 가정)
            //   - v8: { today?: boolean, attended?: boolean, ... }
            //   - v9(set)에서도 Boolean 변환으로 안전
            const mods: Record<string, unknown> = (props as any).modifiers || {};
            const isAttended = !!mods.attended;
            const isToday = !!mods.today;

            // 미래 비활성화 예시
            const isDisabled =
            disableFuture &&
            new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() >
                new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();

            return (
            <button
                type="button"
                className={[
                "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full transition",
                isDisabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100",
                isAttended ? "bg-green-50" : "",
                isToday && !isAttended ? "ring-1 ring-blue-300" : "",
                ].join(" ")}
                disabled={isDisabled}
                onClick={() => !isDisabled && handleDayClick(date)}
            >
                <span>{date.getDate()}</span>
                {isAttended && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold opacity-70 rotate-[-14deg]">
                    ✅
                </span>
                )}
            </button>
            );
        },
        }}
      />

      {/* 하단 라벨 */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500/60 ring-2 ring-green-500/60" />
          <span>출석</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-400/70" />
          <span>오늘</span>
        </div>
      </div>
    </div>
  );
}
