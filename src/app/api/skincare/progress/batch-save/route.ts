import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// time_of_day 타입 정의 (필수 값)
type TimeOfDay = 'morning' | 'midday' | 'evening';

const VALID_TIME_OF_DAY: TimeOfDay[] = ['morning', 'midday', 'evening'];

interface ProgressItem {
  step_uuid: string;      // id_uuid 직접 사용
  time_of_day: TimeOfDay; // 필수! (morning/midday/evening)
  completed: boolean;
  date: string;           // "YYYY-MM-DD"
}

interface BatchSaveRequest {
  id_uuid_member: string;
  routine_uuid: string;
  progress: ProgressItem[];
}

/**
 * 루틴 진행 상태 배치 저장 API
 *
 * POST /api/skincare/progress/batch-save
 *
 * Body:
 * {
 *   id_uuid_member: string,
 *   routine_uuid: string,
 *   progress: [
 *     { step_uuid: "uuid-abc-123", time_of_day: "morning", completed: true, date: "2024-12-31" },
 *     ...
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: BatchSaveRequest = await request.json();
    const { id_uuid_member, routine_uuid, progress } = body;

    console.log('[DEBUG] 💾 Batch save request:', { id_uuid_member, routine_uuid, progressCount: progress.length });

    if (!id_uuid_member || !routine_uuid) {
      return NextResponse.json(
        { success: false, error: 'id_uuid_member and routine_uuid are required' },
        { status: 400 }
      );
    }

    if (!progress || !Array.isArray(progress) || progress.length === 0) {
      return NextResponse.json(
        { success: false, error: 'progress array is required' },
        { status: 400 }
      );
    }

    let insertedCount = 0;
    let updatedCount = 0;

    // 각 진행 상태 UPSERT (step_uuid 직접 사용)
    for (const item of progress) {
      const { step_uuid, time_of_day, completed, date } = item;

      if (!step_uuid) {
        console.warn('[DEBUG] ⚠️ Missing step_uuid, skipping:', {
          id_uuid_member,
          routine_uuid,
          item
        });
        continue;
      }

      // time_of_day 필수 검증
      if (!time_of_day || !VALID_TIME_OF_DAY.includes(time_of_day)) {
        console.warn('[DEBUG] ⚠️ Invalid or missing time_of_day:', {
          time_of_day,
          step_uuid,
          id_uuid_member,
          routine_uuid,
          item
        });
        continue;
      }

      // UPSERT: step_uuid 기준으로 저장
      const result = await query(`
        INSERT INTO skincare_routine_progress (
          id_uuid_member, routine_uuid, step_uuid, time_of_day, completion_date, completed, completed_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (id_uuid_member, routine_uuid, step_uuid, completion_date)
        DO UPDATE SET
          completed = EXCLUDED.completed,
          completed_at = CASE WHEN EXCLUDED.completed THEN NOW() ELSE NULL END,
          updated_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `, [
        id_uuid_member,
        routine_uuid,
        step_uuid,
        time_of_day,
        date,
        completed,
        completed ? new Date().toISOString() : null
      ]);

      if (result.rows[0]?.inserted) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }

    console.log('[DEBUG] ✅ Batch save complete:', { insertedCount, updatedCount });

    return NextResponse.json({
      success: true,
      saved_count: insertedCount + updatedCount,
      inserted_count: insertedCount,
      updated_count: updatedCount
    });

  } catch (error) {
    console.error('[DEBUG] ❌ Batch save error:', error);
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
