import { NextRequest, NextResponse } from 'next/server';
import { one, q } from '@/lib/db';

/**
 * 사용자의 저장된 루틴 조회 API
 *
 * GET /api/skincare/routines/user/[id_uuid_member]
 *
 * 응답:
 * - 사용자의 활성화된 루틴 (is_active = true)
 * - 아침/점심/저녁 스텝 포함
 * - 사용자 프로필 정보 포함
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id_uuid_member: string }> }
) {
  try {
    const { id_uuid_member } = await params;

    if (!id_uuid_member) {
      return NextResponse.json(
        { success: false, error: 'id_uuid_member is required' },
        { status: 400 }
      );
    }

    // 1. 사용자의 활성화된 루틴 조회
    const routine = await one(`
      SELECT
        id_uuid as routine_uuid,
        id_uuid_member,
        routine_type,
        routine_name,
        routine_description,
        is_active,
        is_default,
        created_at,
        updated_at
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

    // 2. 루틴 스텝 조회 (아침/점심/저녁)
    const [morningSteps, middaySteps, eveningSteps] = await Promise.all([
      q(`
        SELECT
          id_uuid, step_order, step_type, step_name,
          recommended_ingredients, recommendation_reason,
          usage_frequency, is_enabled
        FROM skincare_routine_steps
        WHERE routine_uuid = $1 AND time_of_day = 'morning' AND is_enabled = TRUE
        ORDER BY step_order ASC
      `, [routine.routine_uuid]),
      q(`
        SELECT
          id_uuid, step_order, step_type, step_name,
          recommended_ingredients, recommendation_reason,
          usage_frequency, is_enabled
        FROM skincare_routine_steps
        WHERE routine_uuid = $1 AND time_of_day = 'midday' AND is_enabled = TRUE
        ORDER BY step_order ASC
      `, [routine.routine_uuid]),
      q(`
        SELECT
          id_uuid, step_order, step_type, step_name,
          recommended_ingredients, recommendation_reason,
          usage_frequency, is_enabled
        FROM skincare_routine_steps
        WHERE routine_uuid = $1 AND time_of_day = 'evening' AND is_enabled = TRUE
        ORDER BY step_order ASC
      `, [routine.routine_uuid])
    ]);

    // 3. 사용자 프로필 정보 조회 (선택적)
    const userProfile = await one(`
      SELECT
        age_group, gender, skin_type, skin_concerns,
        fitzpatrick_type, primary_goal, country_code
      FROM skincare_onboarding
      WHERE id_uuid_member = $1
    `, [id_uuid_member]);

    return NextResponse.json({
      success: true,
      data: {
        routine: {
          ...routine,
          morning_steps: morningSteps || [],
          midday_steps: middaySteps || [],
          evening_steps: eveningSteps || [],
          total_steps: (morningSteps?.length || 0) + (middaySteps?.length || 0) + (eveningSteps?.length || 0)
        },
        user_profile: userProfile || null
      }
    });

  } catch (error) {
    console.error('Error fetching user routine:', error);
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
