import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { q } from "@/lib/db";
import { TABLE_RESERVATIONS } from "@/constants/tables";

const reservationSchema = z.object({
  id_user: z.string().optional(),
  name: z.string().min(1),
  english_name: z.string().optional().nullable(),
  passport_name: z.string().optional().nullable(),
  nationality: z.string().min(1),
  gender: z.string().optional().nullable(),
  birth_date: z.string().optional().nullable(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  phone_korea: z.string().optional().nullable(),
  preferred_date: z.string().optional().nullable(),
  preferred_time: z.string().optional().nullable(),
  visitor_count: z.string().optional().nullable(),
  reservation_headcount: z.string().optional().nullable(),
  treatment_experience: z.string().optional().nullable(),
  area_to_improve: z.string().optional().nullable(),
  consultation_request: z.string().optional().nullable(),
  additional_info: z.string().optional().nullable(),
  preferred_languages: z.array(z.string()).optional().nullable(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const parsed = reservationSchema.parse(body);

    const reservationData = {
      id_user: parsed.id_user ?? userId ?? null,
      id_uuid_hospital: params.id,
      name: parsed.name,
      english_name: parsed.english_name ?? null,
      passport_name: parsed.passport_name ?? null,
      nationality: parsed.nationality,
      gender: parsed.gender ?? null,
      birth_date: parsed.birth_date ?? null,
      email: parsed.email,
      phone: parsed.phone ?? null,
      phone_korea: parsed.phone_korea ?? null,
      preferred_date: parsed.preferred_date ?? null,
      preferred_time: parsed.preferred_time ?? null,
      visitor_count: parsed.visitor_count ?? null,
      reservation_headcount: parsed.reservation_headcount ?? null,
      treatment_experience: parsed.treatment_experience ?? null,
      area_to_improve: parsed.area_to_improve ?? null,
      consultation_request: parsed.consultation_request ?? null,
      additional_info: parsed.additional_info ?? null,
      preferred_languages: parsed.preferred_languages ?? [],
      status_code: 1,
      created_at: new Date().toISOString(),
    };

    const rows = await q(
      `INSERT INTO ${TABLE_RESERVATIONS} (
         id_user,
         id_uuid_hospital,
         name,
         english_name,
         passport_name,
         nationality,
         gender,
         birth_date,
         email,
         phone,
         phone_korea,
         preferred_date,
         preferred_time,
         visitor_count,
         reservation_headcount,
         treatment_experience,
         area_to_improve,
         consultation_request,
         additional_info,
         preferred_languages,
         status_code,
         created_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
         $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
         $21::jsonb, $22
       )
       RETURNING *`,
      [
        reservationData.id_user,
        reservationData.id_uuid_hospital,
        reservationData.name,
        reservationData.english_name,
        reservationData.passport_name,
        reservationData.nationality,
        reservationData.gender,
        reservationData.birth_date,
        reservationData.email,
        reservationData.phone,
        reservationData.phone_korea,
        reservationData.preferred_date,
        reservationData.preferred_time,
        reservationData.visitor_count,
        reservationData.reservation_headcount,
        reservationData.treatment_experience,
        reservationData.area_to_improve,
        reservationData.consultation_request,
        reservationData.additional_info,
        JSON.stringify(reservationData.preferred_languages ?? []),
        reservationData.status_code,
        reservationData.created_at,
      ]
    );

    return NextResponse.json({ success: true, data: rows[0] ?? null });
  } catch (error) {
    console.error("Unhandled reservation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
