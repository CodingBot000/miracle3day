'use client';

import { useId } from "react";

type StarProps = {
  filled: 0 | 0.5 | 1;
  size?: number;
  className?: string;
};

const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

// Render single star with optional half fill
function Star({ filled, size = 20, className }: StarProps) {
  const clipId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
    >
      <path d={STAR_PATH} fill="none" stroke="currentColor" />
      {filled === 1 && <path d={STAR_PATH} fill="#FACC15" />}
      {filled === 0.5 && (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width="12" height="24" />
            </clipPath>
          </defs>
          <path d={STAR_PATH} fill="#FACC15" clipPath={`url(#${clipId})`} />
        </>
      )}
    </svg>
  );
}

interface StarsProps {
  score: number;
  size?: number;
  showNumber?: boolean;
  className?: string;
}

export function Stars({ score, size = 20, showNumber = true, className }: StarsProps) {
  const cells: (0 | 0.5 | 1)[] = [];

  for (let i = 1; i <= 5; i += 1) {
    const diff = score - (i - 1);
    const value: 0 | 0.5 | 1 = diff >= 0.75 ? 1 : diff >= 0.25 ? 0.5 : 0;
    cells.push(value);
  }

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      {cells.map((filled, index) => (
        <Star key={index} filled={filled} size={size} />
      ))}
      {showNumber && (
        <span className="ml-1 text-sm text-gray-700">
          {Number.isFinite(score) ? score.toFixed(1) : "-"}
        </span>
      )}
    </div>
  );
}

export default Stars;
