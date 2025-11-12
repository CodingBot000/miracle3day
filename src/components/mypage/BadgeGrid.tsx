"use client";

import Image from "next/image";
import { useState } from "react";
import { getBadgeIcon } from "@/constants/badgeIcons";

interface Badge {
  code: string;
  name: Record<string, string> | string;
  level: number;
  iconUrl?: string;
  earnedAt?: string;
}

interface BadgeGridProps {
  badges: Badge[];
  totalCount: number;
}

export default function BadgeGrid({ badges, totalCount }: BadgeGridProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const displayBadges = badges.slice(0, 4); // Show max 4 badges
  const hasMore = totalCount > 4;

  if (badges.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm">
        <div className="text-6xl mb-4">🎖️</div>
        <p className="text-gray-500">No badges earned yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Start participating in the community to earn badges!
        </p>
      </div>
    );
  }

  const handleImageError = (badgeCode: string) => {
    setImageErrors((prev) => new Set(prev).add(badgeCode));
  };

  const getBadgeName = (badge: Badge): string => {
    if (typeof badge.name === 'string') {
      return badge.name;
    }
    return badge.name?.en || badge.name?.ko || badge.code;
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {displayBadges.map((badge) => {
          const icon = getBadgeIcon(badge.code, badge.iconUrl);
          const isEmoji = !icon.startsWith('http') && !icon.startsWith('/');
          const hasError = imageErrors.has(badge.code);

          return (
            <div
              key={`${badge.code}-${badge.earnedAt}`}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow relative"
            >
              {/* Level Badge */}
              <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                L{badge.level}
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-3">
                {isEmoji || hasError ? (
                  <div className="text-4xl">{icon}</div>
                ) : (
                  <div className="relative w-12 h-12">
                    <Image
                      src={icon}
                      alt={getBadgeName(badge)}
                      width={48}
                      height={48}
                      className="object-contain"
                      onError={() => handleImageError(badge.code)}
                    />
                  </div>
                )}
              </div>

              {/* Name */}
              <p className="text-sm font-medium text-gray-800 text-center truncate">
                {getBadgeName(badge)}
              </p>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      {hasMore && (
        <button className="w-full text-center py-3 text-pink-600 font-medium hover:text-pink-700 transition-colors flex items-center justify-center gap-1">
          <span>View all badges ({totalCount})</span>
          <span>→</span>
        </button>
      )}
    </div>
  );
}
