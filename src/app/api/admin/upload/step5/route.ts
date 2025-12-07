import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  TABLE_HOSPITAL_TREATMENT_PREPARE,
  TABLE_TREATMENT_INFO
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
    const treatment_options = formData.get("treatment_options") as string;
    const price_expose_raw = formData.get("price_expose") as string;
    const etc = formData.get("etc") as string;
    
    // selected_treatments 파싱 개선
    const selected_treatments_raw = formData.get("selected_treatments") as string;
    const selected_treatments = selected_treatments_raw && selected_treatments_raw.trim() !== '' 
      ? selected_treatments_raw.split(",").map((treatment: string) => treatment.trim()).filter(t => t !== '')
      : [];

    log.info("Actions - selected_treatments:", {
      raw: selected_treatments_raw,
      parsed: selected_treatments,
      length: selected_treatments.length
    });

    // 가격노출 설정 파싱 (string을 boolean으로 변환)
    const price_expose = price_expose_raw === 'true';
    log.info("Actions - price_expose:", {
      raw: price_expose_raw,
      parsed: price_expose,
      type: typeof price_expose
    });
    
    log.info("Actions - etc 정보:", etc);
    
    // 상품옵션 데이터 파싱
    let treatment_options_parsed = [];
    
    log.info("Actions - treatment_options 원본:", treatment_options);
    log.info("Actions - treatment_options 타입:", typeof treatment_options);
    
    if (treatment_options) {
      try {
        treatment_options_parsed = JSON.parse(treatment_options);
        log.info("Actions - treatment_options 파싱 성공:", treatment_options_parsed);
        log.info("Actions - 파싱된 배열 길이:", treatment_options_parsed.length);
      } catch (error) {
        console.error("Actions - treatment_options 파싱 에러:", error);
        treatment_options_parsed = [];
      }
    } else {
      log.info("Actions - treatment_options가 없습니다.");
    }

    // 편집 모드인 경우 기존 데이터 삭제
    if (isEditMode) {
      log.info("편집 모드: 기존 hospital_treatment 데이터 삭제 중...");
      
      try {
        await pool.query(
          `DELETE FROM ${TABLE_HOSPITAL_TREATMENT_PREPARE} WHERE id_uuid_hospital = $1`,
          [id_uuid_hospital]
        );
        log.info("기존 hospital_treatment 데이터 삭제 완료");
      } catch (error) {
        console.error("기존 hospital_treatment 데이터 삭제 실패:", error);
        return NextResponse.json({
          message: `기존 데이터 삭제 실패: ${(error as any).message}`,
          status: "error",
        }, { status: 500 });
      }
    }

    if (treatment_options_parsed.length > 0) {
      log.info("시술 상품옵션 데이터 처리 시작");
      
      // treatment 테이블에서 code와 id_uuid 매핑 데이터 가져오기
      const { rows: treatmentData } = await pool.query(
        `SELECT code, id_uuid FROM ${TABLE_TREATMENT_INFO}`
      );
      
      // code를 키로 하는 매핑 맵 생성
      const codeToUuidMap = new Map();
      treatmentData?.forEach((treatment: any) => {
        codeToUuidMap.set(treatment.code, treatment.id_uuid);
      });
      
      log.info("시술 코드 매핑 맵:", Object.fromEntries(codeToUuidMap));
      
      // hospital_treatment 테이블에 insert할 데이터 준비
      const hospitalTreatmentInserts = [];
      
      for (const option of treatment_options_parsed) {
        const treatmentUuid = codeToUuidMap.get(option.treatmentKey.toString());
        
        if (!treatmentUuid) {
          console.warn(`시술 코드 ${option.treatmentKey}에 해당하는 UUID를 찾을 수 없습니다.`);
          continue;
        }
        
        const hospitalTreatmentData = {
          id_uuid_hospital: id_uuid_hospital,
          id_uuid_treatment: treatmentUuid,
          option_value: option.value1 || "", // 상품명
          price: parseInt(option.value2) || 0, // 가격
          discount_price: 0, // 디폴트 0
          price_expose: price_expose ? 1 : 0, // 가격노출 설정 (체크되면 1, 해제되면 0)
        };
        
        hospitalTreatmentInserts.push(hospitalTreatmentData);
      }
      
      log.info("hospital_treatment insert 데이터:", hospitalTreatmentInserts);
      
      if (hospitalTreatmentInserts.length > 0) {
        try {
          for (const data of hospitalTreatmentInserts) {
            await pool.query(
              `INSERT INTO ${TABLE_HOSPITAL_TREATMENT_PREPARE} (id_uuid_hospital, id_uuid_treatment, option_value, price, discount_price, price_expose)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [data.id_uuid_hospital, data.id_uuid_treatment, data.option_value, data.price, data.discount_price, data.price_expose]
            );
          }
          log.info("hospital_treatment 데이터 insert 완료");
        } catch (error) {
          log.info("uploadActions hospital_treatment error:", error);
          return NextResponse.json({
            message: `hospitalTreatmentError: ${(error as any).message}`,
            status: "error",
          }, { status: 500 });
        }
      }
      
      // 기타 시술 정보가 있는 경우 별도 레코드로 저장
      if (etc && etc.trim() !== "") {
        log.info("기타 시술 정보 저장 중:", etc);
        
        try {
          await pool.query(
            `INSERT INTO ${TABLE_HOSPITAL_TREATMENT_PREPARE} (id_uuid_hospital, id_uuid_treatment, option_value, price, discount_price, price_expose, etc)
             VALUES ($1, NULL, '기타', 0, 0, 0, $2)`,
            [id_uuid_hospital, etc.trim()]
          );
          log.info("기타 시술 정보 저장 완료");
        } catch (error) {
          log.info("uploadActions hospital_treatment (기타) error:", error);
          return NextResponse.json({
            message: `etcTreatmentError: ${(error as any).message}`,
            status: "error",
          }, { status: 500 });
        }
      }
    }

    return NextResponse.json({
      message: "성공적으로 등록되었습니다.",
      status: "success",
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Step5 API 오류:', error);
    return NextResponse.json({
      message: "서버 오류가 발생했습니다.",
      status: "error",
    }, { status: 500, headers: corsHeaders });
  }
} 