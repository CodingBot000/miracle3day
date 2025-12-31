import { NextRequest, NextResponse } from 'next/server';
import { one, q } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    const routine = await one(`
      SELECT id_uuid, routine_name, routine_description, routine_type, created_at
      FROM skincare_routines
      WHERE id_uuid = $1
    `, [uuid]);

    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    const morningSteps = await q(`
      SELECT * FROM skincare_routine_steps
      WHERE routine_uuid = $1 AND time_of_day = 'morning' AND is_enabled = TRUE
      ORDER BY step_order ASC
    `, [uuid]);

    const middaySteps = await q(`
      SELECT * FROM skincare_routine_steps
      WHERE routine_uuid = $1 AND time_of_day = 'midday' AND is_enabled = TRUE
      ORDER BY step_order ASC
    `, [uuid]);

    const eveningSteps = await q(`
      SELECT * FROM skincare_routine_steps
      WHERE routine_uuid = $1 AND time_of_day = 'evening' AND is_enabled = TRUE
      ORDER BY step_order ASC
    `, [uuid]);

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
