import { NextRequest, NextResponse } from 'next/server';
import { generateRoutine } from '@/lib/skincare/routineGenerator';
import { saveRoutineToDatabase } from '@/lib/skincare/routineQueries';
import { one } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_uuid, routine_type } = body;

    if (!user_uuid) {
      return NextResponse.json({ error: 'user_uuid is required' }, { status: 400 });
    }

    if (!['basic', 'intermediate', 'advanced'].includes(routine_type)) {
      return NextResponse.json({ error: 'Invalid routine_type' }, { status: 400 });
    }

    const userProfile = await getUserProfile(user_uuid);

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const routine = await generateRoutine(userProfile, routine_type);
    const savedRoutine = await saveRoutineToDatabase(user_uuid, routine);

    return NextResponse.json({
      success: true,
      routine_uuid: savedRoutine.id_uuid,
      routine_type: routine.type,
      steps_count: {
        morning: routine.morning.length,
        midday: routine.midday.length,
        evening: routine.evening.length,
        total: routine.morning.length + routine.midday.length + routine.evening.length
      }
    });

  } catch (error) {
    console.error('Error generating routine:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function getUserProfile(user_uuid: string) {
  try {
    const profile = await one(`
      SELECT
        id_uuid, age_group, gender, country_code, region, city,
        skin_type, skin_concerns, fitzpatrick_type,
        current_products, daily_routine_time, primary_goal,
        interested_ingredients, product_preferences,
        sleep_pattern, work_environment, exercise_frequency, monthly_budget
      FROM skincare_onboarding
      WHERE id_uuid = $1 AND onboarding_completed = TRUE
    `, [user_uuid]);

    if (!profile) return null;

    // Add default climate data (can be enhanced with actual climate API later)
    profile.climate = { temperature: 15, humidity: 60, uv_index: 5 };
    return profile;

  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}
