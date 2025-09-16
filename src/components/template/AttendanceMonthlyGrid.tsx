"use client";

import * as React from "react";

// ========== Types ==========
type Props = {
  /** 예: 2025 */
  year: number;
  /** 1~12 */
  month: number;
  /** 출석한 '일(day)'만 전달 (1~31) */
  attendedDays: number[];
  /** 날짜 클릭(출석하기) 시 호출. 성공하면 true 반환 */
  onCheckIn?: (date: Date) => Promise<boolean> | boolean;
  /** 오늘 이후는 클릭 막기 (기본 true) */
  disableFuture?: boolean;
  /** 이미 출석한 날짜 재클릭 허용 여부 (기본 false) */
  allowRecheck?: boolean;
  className?: string;
};

// ========== Utils ==========
const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** 해당 월의 1일 Date */
function firstOfMonth(y: number, m1to12: number) {
  return new Date(y, m1to12 - 1, 1);
}
/** 해당 월의 말일 숫자 */
function lastDayOfMonth(y: number, m1to12: number) {
  return new Date(y, m1to12, 0).getDate();
}
/** 주 시작(월요일)로 보정된 그 주의 월요일 Date */
function startOfWeekMonday(d: Date) {
  const day = d.getDay(); // 0=Sun,1=Mon,...6=Sat
  const diff = (day + 6) % 7; // Sun(0)->6, Mon(1)->0, ...
  const out = new Date(d);
  out.setDate(d.getDate() - diff);
  out.setHours(0, 0, 0, 0);
  return out;
}
/** 주 단위(월~일) 2차원 배열 생성 (해당 월을 모두 커버) */
function buildMonthMatrix(y: number, m1to12: number) {
  const first = firstOfMonth(y, m1to12);
  const start = startOfWeekMonday(first);
  const weeks: { date: Date; inMonth: boolean }[][] = [];

  const last = lastDayOfMonth(y, m1to12);
  const endOfMonth = new Date(y, m1to12 - 1, last);
  // end 라인도 일요일까지 채우기
  const end = new Date(endOfMonth);
  const endDow = end.getDay();
  const plus = (7 - ((endDow + 6) % 7) - 1 + 7) % 7; // 월~일 끝까지 채우는 보정
  end.setDate(end.getDate() + plus);

  let cursor = new Date(start);
  while (cursor <= end) {
    const week: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const cell = new Date(cursor);
      week.push({
        date: cell,
        inMonth: cell.getMonth() === m1to12 - 1,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ========== Component ==========
export default function AttendanceMonthlyGrid({
  year,
  month,
  attendedDays,
  onCheckIn,
  disableFuture = true,
  allowRecheck = false,
  className,
}: Props) {
  const [viewY, setViewY] = React.useState(year);
  const [viewM, setViewM] = React.useState(month);
  const [attended, setAttended] = React.useState<Set<number>>(new Set(attendedDays));
  const today = React.useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  // props 변화 동기화
  React.useEffect(() => setViewY(year), [year]);
  React.useEffect(() => setViewM(month), [month]);
  React.useEffect(() => setAttended(new Set(attendedDays)), [attendedDays]);

  const matrix = React.useMemo(() => buildMonthMatrix(viewY, viewM), [viewY, viewM]);
  const headerLabel = `${viewY}.${String(viewM).padStart(2, "0")}`;

  // 월 전환(내부 상태 변경만)
  const prevMonth = () => {
    const d = new Date(viewY, viewM - 2, 1);
    setViewY(d.getFullYear());
    setViewM(d.getMonth() + 1);
  };
  const nextMonth = () => {
    const d = new Date(viewY, viewM, 1);
    setViewY(d.getFullYear());
    setViewM(d.getMonth() + 1);
  };

  async function handleClick(date: Date) {
    // 월 외 날짜는 무시(원하면 허용 가능)
    if (date.getMonth() !== viewM - 1) return;

    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    // 미래 금지
    if (disableFuture && d.getTime() > today.getTime()) return;

    const dayNum = d.getDate();
    if (!allowRecheck && attended.has(dayNum)) return;

    let ok = true;
    try {
      if (onCheckIn) ok = !!(await onCheckIn(d));
    } catch {
      ok = false;
    }
    if (ok) {
      setAttended((prev) => new Set(prev).add(dayNum));
    }
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className ?? ""}`}>
      {/* 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
          onClick={prevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-lg font-semibold">{headerLabel}</div>
        <button
          className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
          onClick={nextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* 요일 헤더 (영문) */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-600">
        {WEEKDAYS_EN.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 (주 단위) */}
      <div className="grid grid-rows-6 gap-y-0.5">
        {matrix.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map(({ date, inMonth }, di) => {
              const isToday = sameDay(date, today);
              const isFuture =
                new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() >
                today.getTime();
              const isDisabled = (disableFuture && isFuture) || !inMonth;
              const isAttended = inMonth && attended.has(date.getDate());

              return (
                <div key={di} className="px-1 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleClick(date)}
                    disabled={isDisabled}
                    className={[
                      "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full transition",
                      isDisabled
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-100",
                      isAttended ? "bg-green-50" : "",
                      isToday && inMonth && !isAttended ? "ring-1 ring-blue-300" : "",
                      !inMonth ? "opacity-50" : "",
                    ].join(" ")}
                  >
                    <span className="text-sm">
                      {date.getDate()}
                    </span>

                    {isAttended && (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold opacity-80 rotate-[-14deg]">
                        ✅
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500/60 ring-2 ring-green-500/60" />
          <span>Attended</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-400/70" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
