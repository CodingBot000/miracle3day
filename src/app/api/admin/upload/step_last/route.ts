import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  TABLE_HOSPITAL_DETAIL_PREPARE,
  TABLE_FEEDBACKS
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
    const available_languages_raw = formData.get("available_languages") as string;
    const feedback = formData.get("feedback") as string;
    
    const available_languages = JSON.parse(available_languages_raw);

    log.info("uploadActionsStep5 available_languages_raw:", available_languages_raw);
    log.info("uploadActionsStep5 feedback: ", feedback);
    log.info("uploadActionsStep5 id_uuid_hospital: ", id_uuid_hospital);
  
    // 1. 가능 언어 정보 업데이트
    await pool.query(
      `UPDATE ${TABLE_HOSPITAL_DETAIL_PREPARE} SET available_languages = $1 WHERE id_uuid_hospital = $2`,
      [JSON.stringify(available_languages), id_uuid_hospital]
    );
  
    // 2. 피드백 정보 저장 (피드백이 있을 때만)
    if (feedback && feedback.trim()) {
      log.info("피드백 저장 시작:", feedback);
      
      // 피드백은 항상 새로운 레코드로 insert (id_uuid_hospital 중복 허용)
      try {
        await pool.query(
          `INSERT INTO ${TABLE_FEEDBACKS} (id_uuid_hospital, feedback_content) VALUES ($1, $2)`,
          [id_uuid_hospital, feedback.trim()]
        );
        
        log.info("피드백 저장 완료:", feedback);
      } catch (feedbackError) {
        log.info("uploadActions5 feedback insert error:", feedbackError);
        return NextResponse.json({
          message: `feedbackInsertError: ${(feedbackError as any).message}`,
          status: "error",
        }, { status: 500 });
      }
    } else {
      log.info("피드백이 없어서 저장하지 않음");
    }

    log.info("가능 언어 및 피드백 저장 완료 ");
   
    return NextResponse.json({
      message: "성공적으로 등록되었습니다.",
      status: "success",
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Step_last API 오류:', error);
    return NextResponse.json({
      message: "서버 오류가 발생했습니다.",
      status: "error",
    }, { status: 500, headers: corsHeaders });
  }
} 