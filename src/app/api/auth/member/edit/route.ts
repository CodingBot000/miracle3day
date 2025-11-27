import { NextResponse, NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-helper";
import { TABLE_MEMBERS } from "@/constants/tables";
import { q } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const authSession = await getAuthSession(req);
  if (!authSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId } = authSession;

  try {
    const body = await req.json();

    // 업데이트할 필드들
    const nickname = body.nickname?.trim() || null;
    const gender = body.gender || null;
    const idCountry = body.id_country || null;
    const phoneCountryCode = body.phone_country_code || null;
    const phoneNumber = body.phone_number || null;
    const secondaryEmail = body.secondary_email?.trim() || null;
    const birthDate = body.birth_date || null;
    log.debug("PATCH /api/auth/member/edit body:", body);
    const result = await q(
      `UPDATE ${TABLE_MEMBERS}
       SET nickname = COALESCE($1, nickname),
           gender = COALESCE($2, gender),
           id_country = COALESCE($3, id_country),
           phone_country_code = COALESCE($4, phone_country_code),
           phone_number = COALESCE($5, phone_number),
           secondary_email = COALESCE($6, secondary_email),
           birth_date = COALESCE($7, birth_date),
           updated_at = now()
       WHERE id_uuid::text = $8
       RETURNING id_uuid, nickname, gender, id_country, phone_country_code, phone_number, secondary_email, birth_date`,
      [nickname, gender, idCountry, phoneCountryCode, phoneNumber, secondaryEmail, birthDate, userId]
    );

    if (!result.length) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: result[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update member";
    console.error("PATCH /api/auth/member/edit error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
