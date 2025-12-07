import { NextRequest, NextResponse } from "next/server";
import { pool } from '@/lib/db';
import { ReservationInputDto } from "@/models/admin/reservation.dto";
import { TABLE_RESERVATIONS } from "@/constants/tables";
import { RESERVATION_STATUS } from "@/constants/reservation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_uuid_hospital = searchParams.get("id_uuid_hospital") as string;

  
  try {
    const { rows: data } = await pool.query(
      `SELECT * FROM ${TABLE_RESERVATIONS} WHERE id_uuid_hospital = $1`,
      [id_uuid_hospital]
    );

    return NextResponse.json({ reservationData : data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ status: 500, statusText: error.message });
    }
  }
}


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    
    // Next.js 15에서 params는 Promise 타입
    const resolvedParams = await params;
    const hospitalId = resolvedParams.id;

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
      status_code: RESERVATION_STATUS.PENDING,
      created_at: new Date().toISOString(),
    };

    // POST 로직은 미완성으로 보임
    const data = null;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
