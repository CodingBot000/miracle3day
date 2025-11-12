"use client";

import Link from "next/link";
import AttendanceModalButton from "@/components/template/AttendanceModalButton2";

interface UserLevelCardProps {
  level: number;
  points: number;
  nextLevelPoints: number;
  userUuid: string;
  currentPoints: number; // For attendance display
}

export default function UserLevelCard({
  level,
  points,
  nextLevelPoints,
  userUuid,
  currentPoints,
}: UserLevelCardProps) {
  // Calculate progress percentage
  const currentLevelPoints = level > 1 ? Math.pow(level - 1, 2) * 100 : 0;
  const pointsInCurrentLevel = points - currentLevelPoints;
  const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints;
  const progressPercentage = Math.min(
    100,
    (pointsInCurrentLevel / pointsNeededForNextLevel) * 100
  );

  return (
    <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-bold">Level {level}</h2>
          <p className="text-white/90 text-sm mt-1">{points.toLocaleString()} points</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-sm font-semibold">🎯 Next: Lv.{level + 1}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2 text-white/90">
          <span>{pointsInCurrentLevel.toLocaleString()} / {pointsNeededForNextLevel.toLocaleString()}</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <AttendanceModalButton />
          <span className="ml-2 text-sm font-medium">Points: {currentPoints}</span>
        </div>
        <Link href="/gamification/quize">
          <button className="px-6 py-3 bg-white/90 text-orange-600 font-semibold rounded-xl hover:bg-white transition-all shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap">
            <span>🏆</span>
            <span>Quiz</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
