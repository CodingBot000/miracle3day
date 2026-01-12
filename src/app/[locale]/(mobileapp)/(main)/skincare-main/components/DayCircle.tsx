'use client';

interface DayCircleProps {
  day: string;           // 요일 라벨 ('월', 'Mo', etc.)
  isCompleted: boolean;  // 완료 여부
  isToday: boolean;      // 오늘인지
  isFuture: boolean;     // 미래 날짜인지
}

export default function DayCircle({
  day,
  isCompleted,
  isToday,
  isFuture
}: DayCircleProps) {
  // 과거 날짜 여부
  const isPast = !isFuture && !isToday;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* 동그라미 */}
      <div className="relative w-10 h-10">
        {/* 배경 원 */}
        <div className={`
          absolute inset-0 rounded-full transition-colors duration-300
          ${isFuture
            ? 'bg-white'
            : isPast
              ? isCompleted
                ? 'bg-green-50'  // 과거 완료: 옅은 녹색
                : 'bg-gray-200'  // 과거 미완료: 회색
              : 'bg-gray-50'     // 오늘
          }
        `} />

        {/* 과거 완료 시 녹색 테두리 */}
        {isPast && isCompleted && (
          <div className="absolute inset-0 rounded-full border-[3px] border-green-500" />
        )}

        {/* 과거 미완료 시 회색 테두리 */}
        {isPast && !isCompleted && (
          <div className="absolute inset-0 rounded-full border-2 border-gray-300" />
        )}

        {/* 오늘 강조 테두리 (완료 아닌 경우만) */}
        {isToday && !isCompleted && (
          <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-pulse" />
        )}

        {/* 오늘 완료 시 녹색 테두리 */}
        {isToday && isCompleted && (
          <div className="absolute inset-0 rounded-full border-[3px] border-green-500" />
        )}

        {/* 중앙 요일 텍스트 (항상 표시) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-semibold transition-colors duration-300 ${
            isCompleted
              ? 'text-green-600'
              : isFuture
                ? 'text-gray-700'
                : isToday
                  ? 'text-indigo-600'
                  : 'text-gray-500'
          }`}>
            {day}
          </span>
        </div>
      </div>
    </div>
  );
}
