import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  TABLE_HOSPITAL_PREPARE, 
  TABLE_HOSPITAL_DETAIL_PREPARE, 
  TABLE_ADMIN,
} from '@/constants/tables';
import "@/utils/logger"; 

// CORS 헤더 정의
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const isEditMode = formData.get("is_edit_mode")?.toString() === "true";
    const id_uuid_hospital = formData.get("id_uuid") as string;
    const current_user_uid = formData.get("current_user_uid") as string;
  
    const name = formData.get("name") as string;
    const name_en = formData.get("name_en") as string;
    const surgeries = formData.get("surgeries") as string;
    const searchkey = formData.get("searchkey") as string;
    const search_key = formData.get("search_key") as string;
  
    const address = formData.get("address") as string;
    const addressData = address ? JSON.parse(address) : null;
    const address_full_road = addressData?.address_full_road || '';
    const address_full_road_en = addressData?.address_full_road_en || '';
    const address_full_jibun = addressData?.address_full_jibun || '';
    const address_full_jibun_en = addressData?.address_full_jibun_en || '';
    const address_si = addressData?.address_si || '';
    const address_si_en = addressData?.address_si_en || '';
    const address_gu = addressData?.address_gu || '';
    const address_gu_en = addressData?.address_gu_en || '';
    const address_dong = addressData?.address_dong || '';
    const address_dong_en = addressData?.address_dong_en || '';
    const bname = addressData?.bname || '';
    const bname_en = addressData?.bname_en || '';
    const building_name = addressData?.building_name || '';
    const building_name_en = addressData?.building_name_en || '';
    const zipcode = addressData?.zipcode || '';
    const latitude = addressData?.latitude ? Number(addressData.latitude) : null;
    const longitude = addressData?.longitude ? Number(addressData.longitude) : null;
    const address_detail = addressData?.address_detail || '';
    const address_detail_en = addressData?.address_detail_en || '';
    const directions_to_clinic = addressData?.directions_to_clinic || '';
    const directions_to_clinic_en = addressData?.directions_to_clinic_en || '';

    const location = formData.get("location") as string;

    // Get the last id_unique
    const { rows: lastUniqueRows } = await pool.query(
      `SELECT id_unique FROM ${TABLE_HOSPITAL_PREPARE} ORDER BY id_unique DESC LIMIT 1`
    );

    const nextIdUnique = (lastUniqueRows && lastUniqueRows.length > 0)
      ? lastUniqueRows[0].id_unique + 1
      : 0;

    // Get admin id
    const { rows: adminRows } = await pool.query(
      `SELECT id FROM ${TABLE_ADMIN} WHERE id = $1`,
      [current_user_uid]
    );

    if (!adminRows || adminRows.length === 0) {
      return NextResponse.json({
        message: "Admin user not found",
        status: "error",
      }, { status: 500 });
    }

    const adminId = adminRows[0].id;

    const form_hospital = {
      id_unique: nextIdUnique,
      id_uuid: id_uuid_hospital,
      id_uuid_admin: adminId,
      name,
      name_en,
      searchkey,
      search_key,
      address_full_road,
      address_full_road_en,
      address_full_jibun,
      address_full_jibun_en,
      address_si,
      address_si_en,
      address_gu,
      address_gu_en,
      address_dong,
      address_dong_en,
      bname,
      bname_en,
      building_name,
      building_name_en,
      zipcode,
      latitude,
      longitude,
      address_detail,
      address_detail_en,
      directions_to_clinic,
      directions_to_clinic_en,
      location,
    };

    // Insert or update hospital
    let hospitalId: number;
    if (isEditMode) {
      const { rows: updateRows } = await pool.query(
        `UPDATE ${TABLE_HOSPITAL_PREPARE} SET 
          id_unique=$1, id_uuid_admin=$2, name=$3, name_en=$4, searchkey=$5, search_key=$6,
          address_full_road=$7, address_full_road_en=$8, address_full_jibun=$9, address_full_jibun_en=$10,
          address_si=$11, address_si_en=$12, address_gu=$13, address_gu_en=$14, address_dong=$15, address_dong_en=$16,
          bname=$17, bname_en=$18, building_name=$19, building_name_en=$20, zipcode=$21,
          latitude=$22, longitude=$23, address_detail=$24, address_detail_en=$25, directions_to_clinic=$26, directions_to_clinic_en=$27, location=$28
         WHERE id_uuid = $29 RETURNING id_unique`,
        [nextIdUnique, adminId, name, name_en, searchkey, search_key,
         address_full_road, address_full_road_en, address_full_jibun, address_full_jibun_en,
         address_si, address_si_en, address_gu, address_gu_en, address_dong, address_dong_en,
         bname, bname_en, building_name, building_name_en, zipcode,
         latitude, longitude, address_detail, address_detail_en, directions_to_clinic, directions_to_clinic_en, location, id_uuid_hospital]
      );
      hospitalId = updateRows[0]?.id_unique;
    } else {
      const { rows: insertRows } = await pool.query(
        `INSERT INTO ${TABLE_HOSPITAL_PREPARE} 
          (id_unique, id_uuid, id_uuid_admin, name, name_en, searchkey, search_key,
           address_full_road, address_full_road_en, address_full_jibun, address_full_jibun_en,
           address_si, address_si_en, address_gu, address_gu_en, address_dong, address_dong_en,
           bname, bname_en, building_name, building_name_en, zipcode,
           latitude, longitude, address_detail, address_detail_en, directions_to_clinic, directions_to_clinic_en, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
         RETURNING id_unique`,
        [nextIdUnique, id_uuid_hospital, adminId, name, name_en, searchkey, search_key,
         address_full_road, address_full_road_en, address_full_jibun, address_full_jibun_en,
         address_si, address_si_en, address_gu, address_gu_en, address_dong, address_dong_en,
         bname, bname_en, building_name, building_name_en, zipcode,
         latitude, longitude, address_detail, address_detail_en, directions_to_clinic, directions_to_clinic_en, location]
      );
      hospitalId = insertRows[0]?.id_unique;
    }

    // hospital_details 데이터 생성
    const sns_content_agreement_raw = formData.get("sns_content_agreement") as string;
    const sns_content_agreement = sns_content_agreement_raw === 'null' ? null : Number(sns_content_agreement_raw) as 1 | 0;

    const introduction = formData.get("introduction") as string || '';
    const introduction_en = formData.get("introduction_en") as string || '';
    
    const hospitalDetailData = {
      id_hospital: hospitalId,
      id_uuid_hospital: id_uuid_hospital,
      email: formData.get("email") as string || '',
      tel: formData.get("tel") as string || '',
      kakao_talk: formData.get("kakao_talk") as string || '',
      line: formData.get("line") as string || '',
      we_chat: formData.get("we_chat") as string || '',
      whats_app: formData.get("whats_app") as string || '',
      telegram: formData.get("telegram") as string || '',
      facebook_messenger: formData.get("facebook_messenger") as string || '',
      instagram: formData.get("instagram") as string || '',
      tiktok: formData.get("tiktok") as string || '',
      youtube: formData.get("youtube") as string || '',
      other_channel: formData.get("other_channel") as string || '',
      map: '',
      etc: '',
      sns_content_agreement: sns_content_agreement,
      introduction: introduction,
      introduction_en: introduction_en,
    };

    // 기존 데이터 확인
    const { rows: existingRows } = await pool.query(
      `SELECT id FROM ${TABLE_HOSPITAL_DETAIL_PREPARE} WHERE id_uuid_hospital = $1`,
      [id_uuid_hospital]
    );

    // Insert or update hospital details
    if (isEditMode && existingRows && existingRows.length > 0) {
      await pool.query(
        `UPDATE ${TABLE_HOSPITAL_DETAIL_PREPARE} SET 
          email=$1, tel=$2, kakao_talk=$3, line=$4, we_chat=$5, whats_app=$6, telegram=$7,
          facebook_messenger=$8, instagram=$9, tiktok=$10, youtube=$11, other_channel=$12,
          sns_content_agreement=$13, introduction=$14, introduction_en=$15
         WHERE id_uuid_hospital = $16`,
        [hospitalDetailData.email, hospitalDetailData.tel, hospitalDetailData.kakao_talk, hospitalDetailData.line,
         hospitalDetailData.we_chat, hospitalDetailData.whats_app, hospitalDetailData.telegram,
         hospitalDetailData.facebook_messenger, hospitalDetailData.instagram, hospitalDetailData.tiktok,
         hospitalDetailData.youtube, hospitalDetailData.other_channel,
         hospitalDetailData.sns_content_agreement, hospitalDetailData.introduction, hospitalDetailData.introduction_en,
         id_uuid_hospital]
      );
    } else {
      await pool.query(
        `INSERT INTO ${TABLE_HOSPITAL_DETAIL_PREPARE} 
          (id_hospital, id_uuid_hospital, email, tel, kakao_talk, line, we_chat, whats_app, telegram,
           facebook_messenger, instagram, tiktok, youtube, other_channel, sns_content_agreement, introduction, introduction_en)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [hospitalDetailData.id_hospital, hospitalDetailData.id_uuid_hospital, hospitalDetailData.email, hospitalDetailData.tel,
         hospitalDetailData.kakao_talk, hospitalDetailData.line, hospitalDetailData.we_chat, hospitalDetailData.whats_app,
         hospitalDetailData.telegram, hospitalDetailData.facebook_messenger, hospitalDetailData.instagram, hospitalDetailData.tiktok,
         hospitalDetailData.youtube, hospitalDetailData.other_channel, hospitalDetailData.sns_content_agreement,
         hospitalDetailData.introduction, hospitalDetailData.introduction_en]
      );
    }

    // admin 테이블의 id_uuid_hospital 업데이트
    if (current_user_uid) {
      const { rows: currentAdminRows } = await pool.query(
        `SELECT id_uuid_hospital FROM ${TABLE_ADMIN} WHERE id = $1`,
        [current_user_uid]
      );

      if (currentAdminRows && currentAdminRows.length > 0 && !currentAdminRows[0].id_uuid_hospital) {
        await pool.query(
          `UPDATE ${TABLE_ADMIN} SET id_uuid_hospital = $1 WHERE id = $2`,
          [id_uuid_hospital, current_user_uid]
        );
      }
    }

    return NextResponse.json({
      message: "성공적으로 등록되었습니다.",
      status: "success",
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Step1 API 오류:', error);
    let userMessage = "서버 오류가 발생했습니다.";
    
    const errorMessage = (error as any)?.message || '';
    
    if (errorMessage.includes('23505')) {
      userMessage = "이미 등록된 병원 정보입니다. 중복된 데이터가 있는지 확인해주세요.";
    } else if (errorMessage.includes('23503')) {
      userMessage = "연결된 데이터에 문제가 있습니다. 관리자에게 문의해주세요.";
    } else if (errorMessage.includes('22P02')) {
      userMessage = "입력된 데이터 형식이 올바르지 않습니다. 숫자 필드를 확인해주세요.";
    } else if (errorMessage.includes('latitude') || errorMessage.includes('longitude')) {
      userMessage = "위치 정보(위도/경도) 형식이 올바르지 않습니다. 주소를 다시 검색해주세요.";
    }
    
    return NextResponse.json({
      message: userMessage,
      status: "error",
    }, { status: 500, headers: corsHeaders });
  }
} 
