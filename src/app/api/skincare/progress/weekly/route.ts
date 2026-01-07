import { NextRequest, NextResponse } from 'next/server';
import { q, one } from '@/lib/db';

// 간단한 인메모리 캐시 (과거 데이터용)
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

/**
 * 주간 진행 통계 API
 *
 * GET /api/skincare/progress/weekly?id_uuid_member=xxx
 *
 * 응답:
 * {
 *   success: true,
 *   data: {
 *     week: "2024-W01",
 *     completion_rate: number,
 *     streak: number,
 *     daily: [{ date, completed, total, rate }, ...]
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_uuid_member = searchParams.get('id_uuid_member');

    console.log('[DEBUG] 📊 Weekly stats request:', { id_uuid_member });

    if (!id_uuid_member) {
      return NextResponse.json(
        { success: false, error: 'id_uuid_member is required' },
        { status: 400 }
      );
    }

    // 1. 사용자의 활성 루틴 조회 (총 스텝 수 파악)
    const routine = await one(`
      SELECT
        id_uuid as routine_uuid,
        (
          SELECT COUNT(*) FROM skincare_routine_steps
          WHERE routine_uuid = skincare_routines.id_uuid AND is_enabled = TRUE
        ) as total_steps
      FROM skincare_routines
      WHERE id_uuid_member = $1 AND is_active = TRUE
      ORDER BY created_at DESC
      LIMIT 1
    `, [id_uuid_member]);

    if (!routine) {
      return NextResponse.json({
        success: false,
        error: 'No active routine found',
        code: 'ROUTINE_NOT_FOUND'
      }, { status: 404 });
    }

    const totalStepsPerDay = parseInt(routine.total_steps) || 10;

    // 2. 최근 7일 날짜 계산
    const today = new Date();
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayStr = dates[dates.length - 1]; // 오늘 날짜
    const cacheKey = `weekly_${id_uuid_member}`;

    // 캐시 확인 (과거 데이터는 캐시에서)
    let daily: Array<{
      date: string;
      label: string;
      completed: number;
      total: number;
      rate: number;
      isToday: boolean;
    }> = [];
    let streak = 0;

    const cached = getCached<{ daily: typeof daily; streak: number }>(cacheKey);

    if (cached) {
      // 캐시된 데이터 사용 (오늘 데이터는 클라이언트에서 덮어씀)
      console.log('[DEBUG] 📦 Using cached weekly data');
      daily = cached.daily;
      streak = cached.streak;
    } else {
      // 3. 테이블 존재 여부 확인
      const tableExists = await one(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'skincare_routine_progress'
        ) AS exists
      `);

      if (tableExists?.exists) {
        // 4. 단일 쿼리로 7일 데이터 조회 (GROUP BY 사용)
        const weeklyData = await q(`
          SELECT
            completion_date::text as date,
            COUNT(*) as completed_count
          FROM skincare_routine_progress
          WHERE id_uuid_member = $1
            AND completion_date >= $2
            AND completion_date <= $3
            AND completed = TRUE
          GROUP BY completion_date
          ORDER BY completion_date
        `, [id_uuid_member, dates[0], dates[dates.length - 1]]);

        // 결과를 날짜별 맵으로 변환
        const completedByDate = new Map<string, number>();
        for (const row of weeklyData) {
          completedByDate.set(row.date, parseInt(row.completed_count));
        }

        // 7일 데이터 구성
        daily = dates.map(dateStr => {
          const date = new Date(dateStr);
          const completed = completedByDate.get(dateStr) || 0;
          return {
            date: dateStr,
            label: dayNames[date.getDay()],
            completed,
            total: totalStepsPerDay,
            rate: totalStepsPerDay > 0 ? Math.round((completed / totalStepsPerDay) * 100) : 0,
            isToday: dateStr === todayStr
          };
        });

        // 5. Streak 계산 - 단일 쿼리로 최적화
        // 어제부터 30일간 완료 여부를 한 번에 조회
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const streakData = await q(`
          SELECT completion_date::text as date
          FROM skincare_routine_progress
          WHERE id_uuid_member = $1
            AND completion_date >= $2
            AND completion_date <= $3
            AND completed = TRUE
          GROUP BY completion_date
          HAVING COUNT(*) > 0
          ORDER BY completion_date DESC
        `, [id_uuid_member, thirtyDaysAgo.toISOString().split('T')[0], yesterday.toISOString().split('T')[0]]);

        // 연속 streak 계산
        const completedDates = new Set(streakData.map((r: { date: string }) => r.date));
        for (let i = 1; i <= 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          if (completedDates.has(dateStr)) {
            streak++;
          } else {
            break;
          }
        }
      } else {
        // 테이블이 없으면 빈 데이터 반환
        daily = dates.map(dateStr => {
          const date = new Date(dateStr);
          return {
            date: dateStr,
            label: dayNames[date.getDay()],
            completed: 0,
            total: totalStepsPerDay,
            rate: 0,
            isToday: dateStr === todayStr
          };
        });
      }

      // 캐시 저장
      setCache(cacheKey, { daily, streak });
    }

    // 6. 전체 평균 계산
    const totalCompleted = daily.reduce((sum, d) => sum + d.completed, 0);
    const totalPossible = totalStepsPerDay * 7;
    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    // 7. 주차 계산
    const weekNumber = getWeekNumber(today);
    const week = `${today.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;

    console.log('[DEBUG] ✅ Weekly stats calculated:', {
      completionRate,
      streak,
      dailyCount: daily.length
    });

    return NextResponse.json({
      success: true,
      data: {
        week,
        completion_rate: completionRate,
        streak,
        total_completed: totalCompleted,
        total_possible: totalPossible,
        daily
      }
    });

  } catch (error) {
    console.error('[DEBUG] ❌ Weekly stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * ISO 주차 번호 계산
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
