import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { log } from "@/utils/logger";
const TABLE_HOSPITAL_TREATMENT_PREPARE_SELECTION = 'hospital_treatment_selection';

// CORS 헤더 정의
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_uuid_hospital = searchParams.get('id_uuid_hospital');

    if (!id_uuid_hospital) {
      return NextResponse.json({
        message: 'id_uuid_hospital is required',
        status: 'error',
      }, { status: 400, headers: corsHeaders });
    }

    log.info("Step6 GET API - id_uuid_hospital:", id_uuid_hospital);

    // hospital_treatment_selection 테이블에서 데이터 조회
    const { rows: data } = await pool.query(
      `SELECT category, ids, device_ids FROM ${TABLE_HOSPITAL_TREATMENT_PREPARE_SELECTION} WHERE id_uuid_hospital = $1`,
      [id_uuid_hospital]
    );

    // 카테고리별로 데이터 분리
    const skinData = data?.find(row => row.category === 'skin');
    const plasticData = data?.find(row => row.category === 'plastic');

    const result = {
      skinTreatmentIds: skinData?.ids || [],
      plasticTreatmentIds: plasticData?.ids || [],
      skinDeviceIds: skinData?.device_ids || [],
      plasticDeviceIds: plasticData?.device_ids || [],
      // 모든 device_ids 합치기 (중복 제거)
      deviceIds: Array.from(new Set([
        ...(skinData?.device_ids || []),
        ...(plasticData?.device_ids || [])
      ])),
    };

    log.info("Step6 GET API - Result:", result);

    return NextResponse.json(result, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Step6 GET API 오류:', error);
    return NextResponse.json({
      message: "서버 오류가 발생했습니다.",
      status: "error",
    }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { id_uuid_hospital, skinTreatmentIds, plasticTreatmentIds, deviceIds } = body;

    log.info("Step6 API - id_uuid_hospital:", id_uuid_hospital);
    log.info("Step6 API - skinTreatmentIds:", skinTreatmentIds);
    log.info("Step6 API - plasticTreatmentIds:", plasticTreatmentIds);
    log.info("Step6 API - deviceIds:", deviceIds);

    // Skin 카테고리 데이터 준비
    const skinData = {
      id_uuid_hospital,
      category: 'skin',
      ids: skinTreatmentIds || [],
      device_ids: deviceIds || [],
    };

    // Plastic 카테고리 데이터 준비
    const plasticData = {
      id_uuid_hospital,
      category: 'plastic',
      ids: plasticTreatmentIds || [],
      device_ids: deviceIds || [],
    };

    // Upsert skin category
    try {
      await pool.query(
        `INSERT INTO ${TABLE_HOSPITAL_TREATMENT_PREPARE_SELECTION}
          (id_uuid_hospital, category, ids, device_ids, updated_at)
         VALUES ($1, $2, $3::text[], $4::text[], now())
         ON CONFLICT (id_uuid_hospital, category)
         DO UPDATE SET
           ids = EXCLUDED.ids,
           device_ids = EXCLUDED.device_ids,
           updated_at = now()`,
        [
          skinData.id_uuid_hospital,
          skinData.category,
          skinData.ids,          // <-- 배열 ['S3CCE','S3CCJ',...]
          skinData.device_ids    // <-- 배열
        ]
      );
    } catch (error) {
      log.error("Step6 API - Skin upsert error:", error);
      return NextResponse.json({
        message: `Skin upsert error: ${(error as any).message}`,
        status: "error",
      }, { status: 500, headers: corsHeaders });
    }

    // Upsert plastic category
    try {
    
      await pool.query(
        `INSERT INTO ${TABLE_HOSPITAL_TREATMENT_PREPARE_SELECTION}
          (id_uuid_hospital, category, ids, device_ids, updated_at)
          VALUES ($1, $2, $3::text[], $4::text[], now())
          ON CONFLICT (id_uuid_hospital, category)
          DO UPDATE SET
            ids = EXCLUDED.ids,
            device_ids = EXCLUDED.device_ids,
            updated_at = now()`,
        [
          plasticData.id_uuid_hospital,
          plasticData.category,
          plasticData.ids,        // ['P3FEA', 'P3FEB'] 형태의 배열
          plasticData.device_ids  // ['D123', 'D456'] 등
        ]
      );
    } catch (error) {
      log.error("Step6 API - Plastic upsert error:", error);
      return NextResponse.json({
        message: `Plastic upsert error: ${(error as any).message}`,
        status: "error",
      }, { status: 500, headers: corsHeaders });
    }

    log.info("Step6 API - Treatment and device selections saved successfully");

    return NextResponse.json({
      message: "선택 항목이 성공적으로 저장되었습니다.",
      status: "success",
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Step6 API 오류:', error);
    return NextResponse.json({
      message: "서버 오류가 발생했습니다.",
      status: "error",
    }, { status: 500, headers: corsHeaders });
  }
} 