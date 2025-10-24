import { NextResponse } from "next/server";
import { TABLE_MEMBERS } from "@/constants/tables";
import { q } from "@/lib/db";
import { country } from "@/constants/country";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      uuid,
      displayName,
      fullName,
      nation,
      birthYear,
      birthMonth,
      birthDay,
      gender,
      email,
    } = body ?? {};

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    const countryData = country.find((c) => c.country_code === nation);
    if (!nation || !countryData) {
      return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
    }

    const paddedMonth = String(birthMonth).padStart(2, "0");
    const paddedDay = String(birthDay).padStart(2, "0");
    const birthDate = `${birthYear}-${paddedMonth}-${paddedDay}`;

    const updateData: Record<string, any> = {
      nickname: displayName,
      id_country: countryData.country_code,
      birth_date: birthDate,
      gender,
    };

    if (fullName?.trim()) {
      updateData.name = fullName.trim();
    }

    if (email?.trim()) {
      updateData.secondary_email = email.trim();
    }

    const entries = Object.entries(updateData).filter(([, value]) => value !== undefined);
    if (!entries.length) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const fields: string[] = [];
    const values: any[] = [];

    entries.forEach(([key, value], idx) => {
      fields.push(`${key} = $${idx + 1}`);
      values.push(value);
    });

    values.push(uuid);

    const rows = await q(
      `UPDATE ${TABLE_MEMBERS}
       SET ${fields.join(", ")}, updated_at = NOW()
       WHERE uuid = $${values.length}
       RETURNING *`,
      values
    );

    return NextResponse.json({ data: rows[0] ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    console.error("PUT /api/auth/update_profile error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
