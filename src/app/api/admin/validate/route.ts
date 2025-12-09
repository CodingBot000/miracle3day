import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  TABLE_HOSPITAL_PREPARE,
  TABLE_HOSPITAL_DETAIL_PREPARE
} from '@/constants/tables';
import { log } from "@/utils/logger";

// CORS 헤더 정의
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  log.info('=== validate GET START ===');

  try {
    // URL에서 query parameter 추출
    const { searchParams } = new URL(request.url);
    const id_uuid = searchParams.get('id_uuid');

    // id_uuid 유효성 검사
    if (!id_uuid) {
      log.info('id_uuid 파라미터가 필요합니다');
      return NextResponse.json({
        message: "id_uuid 파라미터가 필요합니다.",
        status: "error",
        data: {
          hospital_exists: false,
          hospital_detail_exists: false
        }
      }, { status: 400, headers: corsHeaders });
    }

    log.info('유효성 검사 시작:', { id_uuid });

    // 1. TABLE_HOSPITAL_PREPARE id_uuid로 데이터 존재 여부 확인
    const { rows: hospitalRows } = await pool.query(
      `SELECT id_uuid FROM ${TABLE_HOSPITAL_PREPARE} WHERE id_uuid = $1`,
      [id_uuid]
    );

    const hospitalExists = hospitalRows.length > 0;
    log.info('병원 테이블 존재 여부:', hospitalExists);

    // 2. TABLE_HOSPITAL_DETAIL_PREPARE에서 id_uuid_hospital로 데이터 존재 여부 확인
    const { rows: hospitalDetailRows } = await pool.query(
      `SELECT id_uuid_hospital FROM ${TABLE_HOSPITAL_DETAIL_PREPARE} WHERE id_uuid_hospital = $1`,
      [id_uuid]
    );

    const hospitalDetailExists = hospitalDetailRows.length > 0;
    log.info('병원 상세 테이블 존재 여부:', hospitalDetailExists);

    // 결과 반환
    const result = {
      hospital_exists: hospitalExists,
      hospital_detail_exists: hospitalDetailExists
    };

    log.info('유효성 검사 결과:', result);
    log.info('=== validate GET SUCCESS ===');
  
    return NextResponse.json({
      message: "유효성 검사 완료",
      status: "success",
      data: result
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('validate GET 전체 오류:', error);
    return NextResponse.json({
      message: `처리 중 오류가 발생했습니다: ${error}`,
      status: "error",
      data: {
        hospital_exists: false,
        hospital_detail_exists: false
      }
    }, { status: 500, headers: corsHeaders });
  }
}