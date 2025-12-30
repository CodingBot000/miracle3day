import { one, query } from '@/lib/db';
import { GeneratedRoutine } from './routineGenerator';
import { StepTemplate } from './routineTemplates';

export interface SavedRoutine {
  id_uuid: string;
  user_uuid: string;
  routine_type: string;
  routine_name: string;
  routine_description: string;
  is_active: boolean;
  is_default: boolean;
}

export async function saveRoutineToDatabase(
  user_uuid: string,
  routine: GeneratedRoutine
): Promise<SavedRoutine> {
  try {
    const routineData = {
      user_uuid,
      routine_type: routine.type,
      routine_name: getRoutineName(routine.type),
      routine_description: `AI-generated ${routine.type} skincare routine with midday care`,
      is_active: true,
      is_default: true
    };

    // First, deactivate any existing active routines for this user
    await query(`
      UPDATE skincare_routines
      SET is_active = FALSE, is_default = FALSE
      WHERE user_uuid = $1 AND is_active = TRUE
    `, [user_uuid]);

    // Insert the new routine
    const insertedRoutine = await one<{ id_uuid: string }>(`
      INSERT INTO skincare_routines (
        user_uuid, routine_type, routine_name, routine_description, is_active, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_uuid
    `, [
      routineData.user_uuid,
      routineData.routine_type,
      routineData.routine_name,
      routineData.routine_description,
      routineData.is_active,
      routineData.is_default
    ]);

    if (!insertedRoutine) {
      throw new Error('Failed to insert routine');
    }

    const routine_uuid = insertedRoutine.id_uuid;

    // Save all steps for each time of day
    for (const step of routine.morning) {
      await saveStep(routine_uuid, 'morning', step);
    }

    for (const step of routine.midday) {
      await saveStep(routine_uuid, 'midday', step);
    }

    for (const step of routine.evening) {
      await saveStep(routine_uuid, 'evening', step);
    }

    return {
      id_uuid: routine_uuid,
      ...routineData
    };

  } catch (error) {
    console.error('Error saving routine to database:', error);
    throw error;
  }
}

async function saveStep(
  routine_uuid: string,
  time_of_day: 'morning' | 'midday' | 'evening',
  step: StepTemplate
): Promise<void> {
  await query(`
    INSERT INTO skincare_routine_steps (
      routine_uuid, time_of_day, step_order, step_type, step_name,
      recommended_ingredients, recommendation_reason, usage_frequency
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    routine_uuid,
    time_of_day,
    step.step_order,
    step.step_type,
    step.step_name,
    step.recommended_ingredients || [],
    step.recommendation_reason || '',
    'daily'
  ]);
}

function getRoutineName(type: string): string {
  switch (type) {
    case 'basic':
      return 'My Basic Routine';
    case 'intermediate':
      return 'My Personalized Routine';
    case 'advanced':
      return 'My Advanced Routine';
    default:
      return 'My Skincare Routine';
  }
}
