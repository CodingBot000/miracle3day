"use client";

import { useEffect, useState } from "react";
import UserLevelCard from "./UserLevelCard";
import BadgeGrid from "./BadgeGrid";
import BadgeProgressCard from "./BadgeProgressCard";
import BadgeErrorFallback from "./BadgeErrorFallback";
import BadgeSkeleton from "./BadgeSkeleton";

interface Badge {
  code: string;
  name: Record<string, string> | string;
  level: number;
  iconUrl?: string;
  earnedAt?: string;
}

interface BadgeProgress {
  code: string;
  name: Record<string, string> | string;
  currentLevel: number;
  progress: number;
  threshold: number;
  iconUrl?: string;
}

interface BadgeProfileData {
  level: number;
  points: number;
  nextLevelPoints: number;
  earnedBadges: Badge[];
  inProgressBadges: BadgeProgress[];
}

interface BadgeSectionProps {
  userUuid: string;
  currentPoints: number; // Attendance points from parent
}

type LoadingState = 'loading' | 'success' | 'error';

export default function BadgeSection({
  userUuid,
  currentPoints,
}: BadgeSectionProps) {
  const [state, setState] = useState<LoadingState>('loading');
  const [profileData, setProfileData] = useState<BadgeProfileData | null>(null);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRY = 3;

  useEffect(() => {
    loadBadges();
  }, [userUuid, retryCount]);

  async function loadBadges() {
    if (retryCount >= MAX_RETRY) {
      setState('error');
      setError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    setState('loading');
    setError('');

    try {
      const response = await fetch(
        `/api/gamification/badges/profile?userUuid=${userUuid}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load badges: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.profile) {
        throw new Error('Invalid response format');
      }

      setProfileData({
        level: data.profile.level || 1,
        points: data.profile.points || 0,
        nextLevelPoints: data.profile.nextLevelExp || 100,
        earnedBadges: data.profile.earnedBadges || [],
        inProgressBadges: data.profile.inProgressBadges || [],
      });
      setState('success');
    } catch (err) {
      console.error('Badge loading error:', err);
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to load badges');
    }
  }

  function handleRetry() {
    setRetryCount(prev => prev + 1);
  }

  // 로딩 상태
  if (state === 'loading') {
    return <BadgeSkeleton />;
  }

  // 에러 상태
  if (state === 'error') {
    return (
      <BadgeErrorFallback
        error={error}
        onRetry={handleRetry}
        canRetry={retryCount < MAX_RETRY}
        retryCount={retryCount}
      />
    );
  }

  // 성공 상태
  if (state === 'success' && profileData) {
    return (
      <section className="space-y-6">
        {/* 레벨 카드 */}
        <UserLevelCard
          level={profileData.level}
          points={profileData.points}
          nextLevelPoints={profileData.nextLevelPoints}
          userUuid={userUuid}
          currentPoints={currentPoints}
        />

        {/* 획득한 배지 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">🏆 Earned Badges</h3>
          <BadgeGrid
            badges={profileData.earnedBadges}
            totalCount={profileData.earnedBadges.length}
          />
        </div>

        {/* 진행 중인 배지 */}
        {profileData.inProgressBadges.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">📊 In Progress</h3>
            <div className="space-y-3">
              {profileData.inProgressBadges.map((badge) => (
                <BadgeProgressCard key={badge.code} badge={badge} />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  return null;
}
