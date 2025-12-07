import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  TABLE_HOSPITAL_DETAIL_PREPARE, 
  TABLE_HOSPITAL_BUSINESS_HOUR_PREPARE
} from '@/constants/tables';
import { log } from "@/utils/logger";

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
    const id_uuid_hospital = formData.get("id_uuid_hospital") as string;
    const current_user_uid = formData.get("current_user_uid") as string;

    const opening_hours_raw = formData.get("opening_hours") as string;
    const extra_options_raw = formData.get("extra_options") as string;

    log.info('current_user_uid', current_user_uid);
    log.info('id_uuid_hospital', id_uuid_hospital);

    // opening_hours JSON 파싱
    let opening_hours_parsed;
    try {
      opening_hours_parsed = JSON.parse(opening_hours_raw);
    } catch (error) {
      console.error("opening_hours 파싱 실패:", error);
      return NextResponse.json({
        message: "영업시간 데이터 파싱에 실패했습니다.",
        status: "error",
      }, { status: 400 });
    }

    // opening_hours_parsed가 null이거나 배열이 아닌 경우 기본값 설정
    if (!opening_hours_parsed || !Array.isArray(opening_hours_parsed)) {
      console.warn("opening_hours 데이터가 올바르지 않습니다:", opening_hours_parsed);
      opening_hours_parsed = []; // 빈 배열로 초기화
    }

    log.info("파싱된 opening_hours (배열):", opening_hours_parsed);

    // 각 요일별로 개별 레코드 생성 및 insert
    const businessHourInserts = [];

    for (let i = 0; i < opening_hours_parsed.length; i++) {
      const hour = opening_hours_parsed[i];
      
      // from과 to를 시간 문자열로 변환 (HH:MM 형식)
      const openTime = hour.from ? `${hour.from.hour.toString().padStart(2, '0')}:${hour.from.minute.toString().padStart(2, '0')}` : null;
      const closeTime = hour.to ? `${hour.to.hour.toString().padStart(2, '0')}:${hour.to.minute.toString().padStart(2, '0')}` : null;
      
      let status = '';
      if (hour.open) {
        status = 'open';
      } else if (hour.closed) {
        status = 'closed';
      } else if (hour.ask) {
        status = 'ask';
      }

      const form_business_hour = {
        id_uuid_hospital: id_uuid_hospital,
        day_of_week: hour.day, // 영어 요일 그대로 저장
        open_time: openTime,
        close_time: closeTime,
        status: status,
      };
      
      businessHourInserts.push(form_business_hour);
    }

    log.info("영업시간 데이터:", businessHourInserts);

    // 먼저 기존 데이터가 있는지 확인
    const { rows: existingBusinessHour } = await pool.query(
      `SELECT * FROM ${TABLE_HOSPITAL_BUSINESS_HOUR_PREPARE} WHERE id_uuid_hospital = $1`,
      [id_uuid_hospital]
    );

    if (existingBusinessHour && existingBusinessHour.length > 0) {
      log.info("hospital_business_hours 데이터가 존재");
      for (const form_business_hour of businessHourInserts) {
        const { day_of_week } = form_business_hour;
      
        try {
          await pool.query(
            `UPDATE ${TABLE_HOSPITAL_BUSINESS_HOUR_PREPARE} 
             SET open_time=$1, close_time=$2, status=$3 
             WHERE id_uuid_hospital=$4 AND day_of_week=$5`,
            [form_business_hour.open_time, form_business_hour.close_time, form_business_hour.status, id_uuid_hospital, day_of_week]
          );
          log.info(`요일 ${day_of_week} 업데이트 성공`);
        } catch (error) {
          console.error(`요일 ${day_of_week} 업데이트 실패:`, error);
        }
      }
    } else {
      log.info("hospital_business_hours 데이터가 존재하지 않습니다. 추가할 데이터: ", businessHourInserts);
      
      try {
        for (const item of businessHourInserts) {
          await pool.query(
            `INSERT INTO ${TABLE_HOSPITAL_BUSINESS_HOUR_PREPARE} (id_uuid_hospital, day_of_week, open_time, close_time, status)
             VALUES ($1, $2, $3, $4, $5)`,
            [item.id_uuid_hospital, item.day_of_week, item.open_time, item.close_time, item.status]
          );
        }
        log.info("영업시간 데이터 삽입 완료");
      } catch (error) {
        console.error("영업시간 데이터 삽입 실패:", error);
        return NextResponse.json({
          message: "영업시간 데이터 저장 실패",
          status: "error",
        }, { status: 500 });
      }
    }

    // extra_options JSON 파싱 및 boolean 변환
    let extra_options_parsed;
    try {
      extra_options_parsed = JSON.parse(extra_options_raw);
    } catch (error) {
      console.error("extra_options 파싱 실패:", error);
      return NextResponse.json({
        message: "추가 옵션 데이터 파싱에 실패했습니다.",
        status: "error",
      }, { status: 400 });
    }

    // string을 boolean으로 변환하는 헬퍼 함수
    const stringToBoolean = (value: any): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return Boolean(value);
    };

    const extra_options = {
      has_private_recovery_room: stringToBoolean(extra_options_parsed.has_private_recovery_room),
      has_parking: stringToBoolean(extra_options_parsed.has_parking),
      has_cctv: stringToBoolean(extra_options_parsed.has_cctv),
      has_night_counseling: stringToBoolean(extra_options_parsed.has_night_counseling),
      has_female_doctor: stringToBoolean(extra_options_parsed.has_female_doctor),
      has_anesthesiologist: stringToBoolean(extra_options_parsed.has_anesthesiologist),
      specialist_count: parseInt(extra_options_parsed.specialist_count) || 0,
    };

    log.info("변환된 opening_hours (배열):", opening_hours_parsed);
    log.info("변환된 extra_options:", extra_options);
    
    // 먼저 기존 데이터가 있는지 확인
    const { rows: existingDetail } = await pool.query(
      `SELECT id FROM ${TABLE_HOSPITAL_DETAIL_PREPARE} WHERE id_uuid_hospital = $1`,
      [id_uuid_hospital]
    );

    if (!existingDetail || existingDetail.length === 0) {
      return NextResponse.json({
        message: "병원 정보가 존재하지 않아 업데이트 할수 없습니다.(uploadActionStep3)",
        status: "error",
      }, { status: 400 });
    }

    try {
      await pool.query(
        `UPDATE ${TABLE_HOSPITAL_DETAIL_PREPARE} 
         SET has_private_recovery_room=$1, has_parking=$2, has_cctv=$3, has_night_counseling=$4, 
             has_female_doctor=$5, has_anesthesiologist=$6, specialist_count=$7
         WHERE id_uuid_hospital=$8`,
        [extra_options.has_private_recovery_room, extra_options.has_parking, extra_options.has_cctv, 
         extra_options.has_night_counseling, extra_options.has_female_doctor, extra_options.has_anesthesiologist,
         extra_options.specialist_count, id_uuid_hospital]
      );
      log.info("hospitalDetail operation 성공");
    } catch (error) {
      log.info("hospitalDetail operation error:", error);
      return NextResponse.json({
        message: "병원 추가 정보 업데이트 실패",
        status: "error",
      }, { status: 500 });
    }

    return NextResponse.json({
      message: "성공적으로 등록되었습니다.",
      status: "success",
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Step3 API 오류:', error);
    return NextResponse.json({
      message: "서버 오류가 발생했습니다.",
      status: "error",
    }, { status: 500, headers: corsHeaders });
  }
} 