import { NextRequest, NextResponse } from 'next/server';
import { q, one } from '@/lib/db';

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

    // 3. 테이블 존재 여부 확인
    const tableExists = await one(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'skincare_routine_progress'
      ) AS exists
    `);

    let daily: Array<{
      date: string;
      label: string;
      completed: number;
      total: number;
      rate: number;
    }> = [];

    if (tableExists?.exists) {
      // 4. 각 날짜별 완료 스텝 수 조회
      for (const dateStr of dates) {
        const result = await one(`
          SELECT COUNT(*) as completed_count
          FROM skincare_routine_progress
          WHERE id_uuid_member = $1
            AND completion_date = $2
            AND completed = TRUE
        `, [id_uuid_member, dateStr]);

        const completedCount = parseInt(result?.completed_count || '0');
        const date = new Date(dateStr);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        daily.push({
          date: dateStr,
          label: dayNames[date.getDay()],
          completed: completedCount,
          total: totalStepsPerDay,
          rate: totalStepsPerDay > 0 ? Math.round((completedCount / totalStepsPerDay) * 100) : 0
        });
      }
    } else {
      // 테이블이 없으면 빈 데이터 반환
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      daily = dates.map(dateStr => {
        const date = new Date(dateStr);
        return {
          date: dateStr,
          label: dayNames[date.getDay()],
          completed: 0,
          total: totalStepsPerDay,
          rate: 0
        };
      });
    }

    // 5. 전체 평균 계산
    const totalCompleted = daily.reduce((sum, d) => sum + d.completed, 0);
    const totalPossible = totalStepsPerDay * 7;
    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    // 6. Streak 계산 (연속 완료 일수)
    let streak = 0;
    if (tableExists?.exists) {
      // 어제부터 거슬러 올라가며 확인
      for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const result = await one(`
          SELECT COUNT(*) as completed_count
          FROM skincare_routine_progress
          WHERE id_uuid_member = $1
            AND completion_date = $2
            AND completed = TRUE
        `, [id_uuid_member, dateStr]);

        const completedCount = parseInt(result?.completed_count || '0');

        // 최소 1개 이상 완료했으면 streak 증가
        if (completedCount > 0) {
          streak++;
        } else {
          break;
        }
      }
    }

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
