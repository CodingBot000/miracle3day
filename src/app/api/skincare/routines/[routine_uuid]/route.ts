import { NextRequest, NextResponse } from 'next/server';
import { one, q } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

interface StepUpdateData {
  id_uuid?: string;  // 기존 스텝이면 있음, 새 스텝이면 없음
  step_order: number;
  step_type: string;
  step_name: string;
  recommended_ingredients?: string[];
  recommendation_reason?: string;
}

interface UpdateRequestBody {
  time_of_day: 'morning' | 'midday' | 'evening';
  steps: StepUpdateData[];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ routine_uuid: string }> }
) {
  try {
    const { routine_uuid: routineUuid } = await params;
    const body: UpdateRequestBody = await request.json();
    const { time_of_day, steps } = body;

    console.log('[API] Updating routine steps:', { routineUuid, time_of_day, stepsCount: steps.length });

    // 1. 기존 스텝 id_uuid 목록 조회
    const existingSteps = await q(`
      SELECT id_uuid FROM skincare_routine_steps
      WHERE routine_uuid = $1 AND time_of_day = $2 AND is_enabled = TRUE
    `, [routineUuid, time_of_day]);
    const existingIds = new Set(existingSteps.map((s: { id_uuid: string }) => s.id_uuid));

    // 2. 전달받은 스텝 분류
    const incomingIds = new Set(steps.filter(s => s.id_uuid).map(s => s.id_uuid));

    // 3. 삭제할 스텝: 기존에 있었지만 전달받은 목록에 없는 것
    const toDelete = Array.from(existingIds).filter(id => !incomingIds.has(id));
    if (toDelete.length > 0) {
      await q(`
        DELETE FROM skincare_routine_steps
        WHERE id_uuid = ANY($1::uuid[])
      `, [toDelete]);
      console.log('[API] Deleted steps:', toDelete.length);
    }

    // 4. 각 스텝 처리
    for (const step of steps) {
      if (step.id_uuid && existingIds.has(step.id_uuid)) {
        // 기존 스텝: UPDATE
        await q(`
          UPDATE skincare_routine_steps
          SET step_order = $1, step_type = $2, step_name = $3,
              recommended_ingredients = $4, recommendation_reason = $5,
              updated_at = NOW()
          WHERE id_uuid = $6
        `, [
          step.step_order,
          step.step_type,
          step.step_name,
          step.recommended_ingredients || [],
          step.recommendation_reason || '',
          step.id_uuid
        ]);
      } else {
        // 새 스텝: INSERT
        const newIdUuid = uuidv4();
        await q(`
          INSERT INTO skincare_routine_steps (
            id_uuid, routine_uuid, time_of_day, step_order, step_type, step_name,
            recommended_ingredients, recommendation_reason, is_enabled, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, NOW(), NOW())
        `, [
          newIdUuid,
          routineUuid,
          time_of_day,
          step.step_order,
          step.step_type,
          step.step_name,
          step.recommended_ingredients || [],
          step.recommendation_reason || ''
        ]);
      }
    }

    // 5. 업데이트된 스텝 조회
    const updatedSteps = await q(`
      SELECT * FROM skincare_routine_steps
      WHERE routine_uuid = $1 AND time_of_day = $2 AND is_enabled = TRUE
      ORDER BY step_order ASC
    `, [routineUuid, time_of_day]);

    console.log('[API] Updated steps:', updatedSteps.length);

    return NextResponse.json({
      success: true,
      time_of_day,
      steps: updatedSteps
    });

  } catch (error) {
    console.error('[API] Error updating routine steps:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ routine_uuid: string }> }
) {
  try {
    const { routine_uuid } = await params;

    const routine = await one(`
      SELECT id_uuid, routine_name, routine_description, routine_type, created_at
      FROM skincare_routines
      WHERE id_uuid = $1
    `, [routine_uuid]);

    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    const morningSteps = await q(`
      SELECT * FROM skincare_routine_steps
      WHERE routine_uuid = $1 AND time_of_day = 'morning' AND is_enabled = TRUE
      ORDER BY step_order ASC
    `, [routine_uuid]);

    const middaySteps = await q(`
      SELECT * FROM skincare_routine_steps
      WHERE routine_uuid = $1 AND time_of_day = 'midday' AND is_enabled = TRUE
      ORDER BY step_order ASC
    `, [routine_uuid]);

    const eveningSteps = await q(`
      SELECT * FROM skincare_routine_steps
      WHERE routine_uuid = $1 AND time_of_day = 'evening' AND is_enabled = TRUE
      ORDER BY step_order ASC
    `, [routine_uuid]);

    return NextResponse.json({
      ...routine,
      morning_steps: morningSteps,
      midday_steps: middaySteps,
      evening_steps: eveningSteps
    });

  } catch (error) {
    console.error('Error fetching routine:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
