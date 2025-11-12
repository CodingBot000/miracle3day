"use client";

import Image from "next/image";
import { useState } from "react";
import { getBadgeIcon } from "@/constants/badgeIcons";

interface BadgeProgress {
  code: string;
  name: Record<string, string> | string;
  currentLevel: number;
  progress: number;
  threshold: number;
  iconUrl?: string;
}

interface BadgeProgressCardProps {
  badge: BadgeProgress;
}

export default function BadgeProgressCard({ badge }: BadgeProgressCardProps) {
  const [imageError, setImageError] = useState(false);
  const icon = getBadgeIcon(badge.code, badge.iconUrl);
  const isEmoji = !icon.startsWith('http') && !icon.startsWith('/');
  const progressPercentage = Math.min(100, (badge.progress / badge.threshold) * 100);

  const getBadgeName = (badgeName: Record<string, string> | string): string => {
    if (typeof badgeName === 'string') {
      return badgeName;
    }
    return badgeName?.en || badgeName?.ko || badge.code;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {isEmoji || imageError ? (
            <div className="text-2xl">{icon}</div>
          ) : (
            <div className="relative w-12 h-12">
              <Image
                src={icon}
                alt={getBadgeName(badge.name)}
                width={48}
                height={48}
                className="object-contain"
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>

        {/* Progress Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800 truncate">
              {getBadgeName(badge.name)}
            </h4>
            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
              Next: Lv.{badge.currentLevel + 1}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-1">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Progress Numbers */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>{badge.progress} / {badge.threshold}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
