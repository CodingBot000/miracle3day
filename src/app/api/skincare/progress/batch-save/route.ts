import { NextRequest, NextResponse } from 'next/server';
import { query, one } from '@/lib/db';

interface ProgressItem {
  step_id: string;      // "morning-1", "midday-6", "evening-10" 형태
  completed: boolean;
  date: string;         // "YYYY-MM-DD"
}

interface BatchSaveRequest {
  user_uuid: string;
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
 *   user_uuid: string,
 *   routine_uuid: string,
 *   progress: [
 *     { step_id: "morning-1", completed: true, date: "2024-12-31" },
 *     ...
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: BatchSaveRequest = await request.json();
    const { user_uuid, routine_uuid, progress } = body;

    console.log('[DEBUG] 💾 Batch save request:', { user_uuid, routine_uuid, progressCount: progress.length });

    if (!user_uuid || !routine_uuid) {
      return NextResponse.json(
        { success: false, error: 'user_uuid and routine_uuid are required' },
        { status: 400 }
      );
    }

    if (!progress || !Array.isArray(progress) || progress.length === 0) {
      return NextResponse.json(
        { success: false, error: 'progress array is required' },
        { status: 400 }
      );
    }

    // 테이블 존재 여부 확인 및 생성
    await ensureProgressTable();

    let insertedCount = 0;
    let updatedCount = 0;

    // 각 진행 상태 UPSERT
    for (const item of progress) {
      const { step_id, completed, date } = item;

      // step_id에서 time_of_day와 step_number 추출
      // 형태: "morning-1", "midday-6", "evening-10"
      const [time_of_day, stepNum] = step_id.split('-');
      const step_number = parseInt(stepNum, 10);

      if (!time_of_day || isNaN(step_number)) {
        console.warn('[DEBUG] ⚠️ Invalid step_id format:', step_id);
        continue;
      }

      // UPSERT: 기존 레코드가 있으면 UPDATE, 없으면 INSERT
      const result = await query(`
        INSERT INTO skincare_routine_progress (
          user_uuid, routine_uuid, step_id, time_of_day, step_number,
          completion_date, completed, completed_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        ON CONFLICT (user_uuid, routine_uuid, step_id, completion_date)
        DO UPDATE SET
          completed = EXCLUDED.completed,
          completed_at = CASE WHEN EXCLUDED.completed THEN NOW() ELSE NULL END,
          updated_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `, [
        user_uuid,
        routine_uuid,
        step_id,
        time_of_day,
        step_number,
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

/**
 * skincare_routine_progress 테이블이 없으면 생성
 */
async function ensureProgressTable() {
  const tableExists = await one(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'skincare_routine_progress'
    ) AS exists
  `);

  if (!tableExists?.exists) {
    console.log('[DEBUG] 📋 Creating skincare_routine_progress table...');

    await query(`
      CREATE TABLE IF NOT EXISTS skincare_routine_progress (
        id SERIAL PRIMARY KEY,
        user_uuid UUID NOT NULL,
        routine_uuid UUID NOT NULL,
        step_id VARCHAR(50) NOT NULL,
        time_of_day VARCHAR(20) NOT NULL,
        step_number INTEGER NOT NULL,
        completion_date DATE NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),

        CONSTRAINT unique_user_step_date
          UNIQUE (user_uuid, routine_uuid, step_id, completion_date)
      )
    `);

    // 인덱스 생성
    await query(`
      CREATE INDEX IF NOT EXISTS idx_progress_user_date
      ON skincare_routine_progress (user_uuid, completion_date)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_progress_routine_date
      ON skincare_routine_progress (routine_uuid, completion_date)
    `);

    console.log('[DEBUG] ✅ Table created successfully');
  }
}
