
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/session/server";
import { ReservationInputDto } from "./reservation.dto"; // 또는 상대 경로
import { TABLE_RESERVATIONS } from "@/constants/tables";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 API Route: POST reservation started');
    const backendClient = createClient();
    const body = await req.json();
    console.log('🔍 API Route: Request body:', body);

    const hospitalId = params.id;
    console.log('🔍 API Route: Hospital ID:', hospitalId);

    const reservationData: ReservationInputDto = {
      id_user: body.id_user,
      id_uuid_hospital: hospitalId,
      name: body.name,
      english_name: body.english_name,
      passport_name: body.passport_name,
      nationality: body.nationality,
      gender: body.gender,
      birth_date: body.birth_date,
      email: body.email,
      phone: body.phone,
      phone_korea: body.phone_korea,
      preferred_date: body.preferred_date,
      preferred_time: body.preferred_time,
      visitor_count: body.visitor_count,
      reservation_headcount: body.reservation_headcount,
      treatment_experience: body.treatment_experience,
      area_to_improve: body.area_to_improve,
      consultation_request: body.consultation_request,
      additional_info: body.additional_info,
      preferred_languages: body.preferred_languages ?? [],
      status_code: 1, // PENDING 상태 코드
      created_at: new Date().toISOString(),
    };
    
    console.log('🔍 API Route: Prepared reservation data:', reservationData);

    const { data, error } = await backendClient
      .from(TABLE_RESERVATIONS)
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
