import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import {
  TABLE_HOSPITAL_PREPARE,
  TABLE_DOCTOR_PREPARE,
  TABLE_HOSPITAL_DETAIL_PREPARE,
  TABLE_HOSPITAL_TREATMENT_PREPARE,
  TABLE_HOSPITAL_BUSINESS_HOUR_PREPARE,
  TABLE_TREATMENT_INFO,
  TABLE_FEEDBACKS,
  TABLE_CONTACTS_PREPARE,
  TABLE_TREATMENT_SELECTION,
  STORAGE_IMAGES
} from '@/constants/tables';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/admin/api-utils';
import { getTreatmentsFilePath } from '@/constants/paths';

/**
 * GET /api/hospital/preview - Fetch ALL hospital data in one consolidated call
 * Query params: id_uuid_hospital (required)
 *
 * This endpoint replaces the 9 separate queries in PreviewClinicInfoModal
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_uuid_hospital = searchParams.get('id_uuid_hospital');

    if (!id_uuid_hospital || id_uuid_hospital.trim() === '' || id_uuid_hospital === 'undefined' || id_uuid_hospital === 'null') {
      return createErrorResponse('Hospital ID is required and must be valid', 400);
    }

    // Execute all queries in parallel for better performance
    const [
      hospitalResult,
      businessHoursResult,
      doctorsResult,
      treatmentsResult,
      hospitalDetailsResult,
      contactsResult,
      treatmentSelectionResult,
      supportTreatmentFeedbackResult,
      generalFeedbackResult
    ] = await Promise.all([
      // 1. Hospital basic info
      pool.query(
        `SELECT * FROM ${TABLE_HOSPITAL_PREPARE} WHERE id_uuid = $1`,
        [id_uuid_hospital]
      ),

      // 2. Business hours
      pool.query(
        `SELECT * FROM ${TABLE_HOSPITAL_BUSINESS_HOUR_PREPARE} WHERE id_uuid_hospital = $1 ORDER BY day_of_week ASC`,
        [id_uuid_hospital]
      ),

      // 3. Doctors
      pool.query(
        `SELECT * FROM ${TABLE_DOCTOR_PREPARE} WHERE id_uuid_hospital = $1 ORDER BY display_order ASC, id_uuid ASC`,
        [id_uuid_hospital]
      ),

      // 4. Treatments
      pool.query(
        `SELECT * FROM ${TABLE_HOSPITAL_TREATMENT_PREPARE} WHERE id_uuid_hospital = $1`,
        [id_uuid_hospital]
      ),

      // 5. Hospital details
      pool.query(
        `SELECT * FROM ${TABLE_HOSPITAL_DETAIL_PREPARE} WHERE id_uuid_hospital = $1`,
        [id_uuid_hospital]
      ),

      // 6. Contacts
      pool.query(
        `SELECT * FROM ${TABLE_CONTACTS_PREPARE} WHERE id_uuid_hospital = $1 ORDER BY type ASC, sequence ASC`,
        [id_uuid_hospital]
      ),

      // 7. Treatment selection
      pool.query(
        `SELECT category, ids, device_ids FROM ${TABLE_TREATMENT_SELECTION} WHERE id_uuid_hospital = $1`,
        [id_uuid_hospital]
      ),

      // 8. Support treatment feedback
      pool.query(
        `SELECT feedback_content FROM ${TABLE_FEEDBACKS} WHERE id_uuid_hospital = $1 AND type = $2 ORDER BY updated_at DESC LIMIT 1`,
        [id_uuid_hospital, 'support_treatment']
      ),

      // 9. General feedback
      pool.query(
        `SELECT feedback_content FROM ${TABLE_FEEDBACKS} WHERE id_uuid_hospital = $1 AND type IS NULL ORDER BY created_at DESC LIMIT 1`,
        [id_uuid_hospital]
      )
    ]);

    // Check for hospital data existence
    if (!hospitalResult.rows || hospitalResult.rows.length === 0) {
      throw new Error('Hospital not found');
    }

    const hospitalData = hospitalResult.rows[0];

    // Get treatment details if treatments exist
    let treatmentDetails: any[] = [];
    if (treatmentsResult.rows && treatmentsResult.rows.length > 0) {
      const treatmentUuids = treatmentsResult.rows
        .filter(treatment => treatment.id_uuid_treatment)
        .map(treatment => treatment.id_uuid_treatment);

      if (treatmentUuids.length > 0) {
        const placeholders = treatmentUuids.map((_, i) => `$${i + 1}`).join(',');
        const treatmentDetailResult = await pool.query(
          `SELECT id_uuid, code, name FROM ${TABLE_TREATMENT_INFO} WHERE id_uuid IN (${placeholders})`,
          treatmentUuids
        );
        treatmentDetails = treatmentDetailResult.rows || [];
      }
    }

    // Check for Excel file - placeholder (requires separate file storage service)
    let excelFileName = '';
    // TODO: Implement file check for AWS S3 or other storage service
    // const filePath = getTreatmentsFilePath(id_uuid_hospital);

    // Organize treatment selection data
    const skinData = treatmentSelectionResult.rows?.find(row => row.category === 'skin');
    const plasticData = treatmentSelectionResult.rows?.find(row => row.category === 'plastic');

    const treatmentSelection = {
      skinTreatmentIds: skinData?.ids || [],
      plasticTreatmentIds: plasticData?.ids || [],
      deviceIds: Array.from(new Set([
        ...(skinData?.device_ids || []),
        ...(plasticData?.device_ids || [])
      ])),
    };

    // Combine all data - nested structure matching ExistingHospitalData interface
    const hospitalInfo = {
      id_uuid: hospitalData.id_uuid,
      name: hospitalData.name,
      name_en: hospitalData.name_en,
      address_full_road: hospitalData.address_full_road,
      address_full_road_en: hospitalData.address_full_road_en,
      address_full_jibun: hospitalData.address_full_jibun,
      address_full_jibun_en: hospitalData.address_full_jibun_en,
      address_si: hospitalData.address_si,
      address_si_en: hospitalData.address_si_en,
      address_gu: hospitalData.address_gu,
      address_gu_en: hospitalData.address_gu_en,
      address_dong: hospitalData.address_dong,
      address_dong_en: hospitalData.address_dong_en,
      bname: hospitalData.bname,
      bname_en: hospitalData.bname_en,
      building_name: hospitalData.building_name,
      building_name_en: hospitalData.building_name_en,
      zipcode: hospitalData.zipcode,
      latitude: hospitalData.latitude,
      longitude: hospitalData.longitude,
      address_detail: hospitalData.address_detail,
      address_detail_en: hospitalData.address_detail_en,
      directions_to_clinic: hospitalData.directions_to_clinic,
      directions_to_clinic_en: hospitalData.directions_to_clinic_en,
      location: hospitalData.location,
      imageurls: hospitalData.imageurls || [],
      thumbnail_url: hospitalData.thumbnail_url || null,
    };

    const hospitalDetailInfo = hospitalDetailsResult.rows?.[0] ? {
      id_hospital: hospitalDetailsResult.rows[0].id_hospital,
      id_uuid_hospital: hospitalDetailsResult.rows[0].id_uuid_hospital,
      tel: hospitalDetailsResult.rows[0].tel,
      email: hospitalDetailsResult.rows[0].email,
      introduction: hospitalDetailsResult.rows[0].introduction,
      introduction_en: hospitalDetailsResult.rows[0].introduction_en,
      kakao_talk: hospitalDetailsResult.rows[0].kakao_talk,
      line: hospitalDetailsResult.rows[0].line,
      we_chat: hospitalDetailsResult.rows[0].we_chat,
      whats_app: hospitalDetailsResult.rows[0].whats_app,
      telegram: hospitalDetailsResult.rows[0].telegram,
      facebook_messenger: hospitalDetailsResult.rows[0].facebook_messenger,
      instagram: hospitalDetailsResult.rows[0].instagram,
      tiktok: hospitalDetailsResult.rows[0].tiktok,
      youtube: hospitalDetailsResult.rows[0].youtube,
      other_channel: hospitalDetailsResult.rows[0].other_channel,
      map: hospitalDetailsResult.rows[0].map,
      etc: hospitalDetailsResult.rows[0].etc,
      has_private_recovery_room: hospitalDetailsResult.rows[0].has_private_recovery_room,
      has_parking: hospitalDetailsResult.rows[0].has_parking,
      has_cctv: hospitalDetailsResult.rows[0].has_cctv,
      has_night_counseling: hospitalDetailsResult.rows[0].has_night_counseling,
      has_female_doctor: hospitalDetailsResult.rows[0].has_female_doctor,
      has_anesthesiologist: hospitalDetailsResult.rows[0].has_anesthesiologist,
      specialist_count: hospitalDetailsResult.rows[0].specialist_count,
      sns_content_agreement: hospitalDetailsResult.rows[0].sns_content_agreement,
      available_languages: hospitalDetailsResult.rows[0].available_languages || [],
    } : null;

    const combinedData = {
      hospital: hospitalInfo,
      hospitalDetail: hospitalDetailInfo,
      businessHours: businessHoursResult.rows || [],
      doctors: doctorsResult.rows || [],
      treatments: treatmentsResult.rows || [],
      feedback: generalFeedbackResult.rows?.[0]?.feedback_content || '',
      contacts: contactsResult.rows || [],
      treatmentDetails: treatmentDetails || [],
      excelFileName,
      treatmentSelection,
      supportTreatmentFeedback: supportTreatmentFeedbackResult.rows?.[0]?.feedback_content || '',
    };

    return createSuccessResponse({ hospital: combinedData });

  } catch (error) {
    console.error('Hospital preview API error:', error);
    return handleApiError(error);
  }
}

/**
 * OPTIONS /api/hospital/preview - CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
