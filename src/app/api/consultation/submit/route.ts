import { NextRequest, NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getUserAPIServer } from '@/app/api/auth/getUser/getUser.server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 데이터 준비
    const submissionId = data.submissionId;
    const formVersion = 1;

    // Private Info
    const privateFirstName = data.userInfo?.firstName || null;
    const privateLastName = data.userInfo?.lastName || null;
    const privateEmail = data.userInfo?.email || null;
    const privateAgeRange = data.userInfo?.ageRange || null;
    const privateGender = data.userInfo?.gender || null;
    const country = data.userInfo?.country || null;
    const koreanPhoneNumber = data.userInfo?.koreanPhoneNumber || null;

    // Messengers 처리
    const messengers = data.userInfo?.messengers?.filter((msg: any) => msg.value?.trim() !== '').map((msg: any) => ({
      ...msg,
      value: msg.type === 'whatsapp' && msg.phone_code ? `+${msg.phone_code}${msg.value}` : msg.value
    })) || [];

    // Single selections
    const skinTypes = data.skinType || null;
    const budgetRanges = data.budget || null;

    // Multi selections with other text
    const skinConcerns = data.skinConcerns?.concerns || [];
    const skinConcernsOther = data.skinConcerns?.moreConcerns || null;
    const treatmentAreas = data.treatmentAreas?.treatmentAreas || [];
    const treatmentAreasOther = data.treatmentAreas?.otherAreas || null;
    const medicalConditions = data.healthConditions?.healthConditions || [];
    const medicalConditionsOther = data.healthConditions?.otherConditions || null;

    // Priority order (drag & drop)
    const priorities = data.priorityOrder?.priorityOrder || [];

    // Multi selections
    const treatmentGoals = data.goals || [];
    const pastTreatments = data.pastTreatments?.pastTreatments || [];

    // Text areas
    const pastTreatmentsSideEffectDesc = data.pastTreatments?.sideEffects || null;
    const anythingElse = data.pastTreatments?.additionalNotes || null;

    // Visit path
    const visitPath = data.visitPath?.visitPath || null;
    const visitPathOther = data.visitPath?.otherPath || null;

    // Demographics Basic (race/ethnic_background)
    const race = data.demographicsBasic?.ethnic_background || null;

    // Image paths
    const imagePaths = data.imagePaths || [];

    // Get logged-in user's member UUID
    let idUuidMember = null;
    try {
      const userResult = await getUserAPIServer();
      if (userResult?.userInfo?.id_uuid) {
        idUuidMember = userResult.userInfo.id_uuid;
      }
    } catch (error) {
      // If session check fails, continue with null (user not logged in)
      console.log('Session check failed or user not logged in:', error);
    }

    // DB에 삽입
    const sql = `
      INSERT INTO consultation_submissions (
        id_uuid, form_version,
        private_first_name, private_last_name, private_email,
        private_age_range, private_gender, country, korean_phone_number,
        messengers, skin_types, budget_ranges,
        skin_concerns, skin_concerns_other,
        treatment_areas, treatment_areas_other,
        medical_conditions, medical_conditions_other,
        priorities, treatment_goals, past_treatments,
        past_treatments_side_effect_desc, anything_else,
        visit_path, visit_path_other, image_paths,
        race, id_uuid_member
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27, $28
      )
      RETURNING id_uuid
    `;

    const params = [
      submissionId, formVersion,
      privateFirstName, privateLastName, privateEmail,
      privateAgeRange, privateGender, country, koreanPhoneNumber,
      messengers, skinTypes, budgetRanges,
      skinConcerns, skinConcernsOther,
      treatmentAreas, treatmentAreasOther,
      medicalConditions, medicalConditionsOther,
      priorities, treatmentGoals, pastTreatments,
      pastTreatmentsSideEffectDesc, anythingElse,
      visitPath, visitPathOther, imagePaths,
      race, idUuidMember
    ];

    const result = await q(sql, params);

    if (!result || result.length === 0) {
      console.error('Database error: No result returned');
      return NextResponse.json(
        { success: false, error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: result[0].id_uuid
    });

  } catch (error: any) {
    console.error('POST consultation/submit error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}