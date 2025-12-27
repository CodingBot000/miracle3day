/**
 * 스킨케어 온보딩 API 라우트
 *
 * POST /api/skincare/onboarding - 데이터 저장
 */

import { NextRequest, NextResponse } from 'next/server';
import { q, one } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 온보딩 데이터 저장
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id_uuid,
      age_group,
      gender,
      country_code,
      region,
      city,
      skin_type,
      skin_concerns,
      current_products,
      daily_routine_time,
      primary_goal,
      interested_ingredients,
      product_preferences,
      sleep_pattern,
      work_environment,
      exercise_frequency,
      monthly_budget,
    } = body;

    // 필수 필드 검증
    if (!id_uuid) {
      return NextResponse.json(
        { success: false, message: 'User UUID is required' },
        { status: 400 }
      );
    }

    // UPSERT: 기존 데이터가 있으면 업데이트, 없으면 삽입
    const result = await one(
      `INSERT INTO skincare_onboarding (
        id_uuid,
        age_group,
        gender,
        country_code,
        region,
        city,
        skin_type,
        skin_concerns,
        current_products,
        daily_routine_time,
        primary_goal,
        interested_ingredients,
        product_preferences,
        sleep_pattern,
        work_environment,
        exercise_frequency,
        monthly_budget,
        onboarding_completed,
        onboarding_step,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, true, 18, NOW(), NOW()
      )
      ON CONFLICT (id_uuid)
      DO UPDATE SET
        age_group = EXCLUDED.age_group,
        gender = EXCLUDED.gender,
        country_code = EXCLUDED.country_code,
        region = EXCLUDED.region,
        city = EXCLUDED.city,
        skin_type = EXCLUDED.skin_type,
        skin_concerns = EXCLUDED.skin_concerns,
        current_products = EXCLUDED.current_products,
        daily_routine_time = EXCLUDED.daily_routine_time,
        primary_goal = EXCLUDED.primary_goal,
        interested_ingredients = EXCLUDED.interested_ingredients,
        product_preferences = EXCLUDED.product_preferences,
        sleep_pattern = EXCLUDED.sleep_pattern,
        work_environment = EXCLUDED.work_environment,
        exercise_frequency = EXCLUDED.exercise_frequency,
        monthly_budget = EXCLUDED.monthly_budget,
        onboarding_completed = true,
        onboarding_step = 18,
        updated_at = NOW()
      RETURNING *`,
      [
        id_uuid,
        age_group || null,
        gender || null,
        country_code || null,
        region || null,
        city || null,
        skin_type || null,
        skin_concerns || null,
        current_products || null,
        daily_routine_time || null,
        primary_goal || null,
        interested_ingredients || null,
        product_preferences || null,
        sleep_pattern || null,
        work_environment || null,
        exercise_frequency || null,
        monthly_budget || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: '온보딩이 완료되었습니다',
      data: result,
    });
  } catch (error) {
    console.error('온보딩 저장 오류:', error);
    const message = error instanceof Error ? error.message : '저장 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
