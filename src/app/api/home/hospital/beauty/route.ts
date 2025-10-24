export const revalidate = 0;
export const runtime = 'nodejs';

import { TABLE_HOSPITAL } from "@/constants/tables";
import { q } from "@/lib/db";
import type { HospitalData } from "@/app/models/hospitalData.dto";

export async function GET() {
  try {
    const sql = `
      SELECT

        created_at,
        name,
        name_en,
        searchkey,
        latitude,
        longitude,
        thumbnail_url,
        imageurls,
        id_surgeries,
        id_unique,
        id_uuid,
        location,
        address_full_road_en,
        address_full_jibun_en,
        show
      FROM ${TABLE_HOSPITAL}
      WHERE show = true
      ORDER BY created_at DESC
      LIMIT 4
    `;

    let rows = await q<HospitalData>(sql);

    if (!rows.length) {
      const fallbackSql = `
        SELECT

        created_at,
        name,
        name_en,
        searchkey,
        latitude,
        longitude,
        thumbnail_url,
        imageurls,
        id_surgeries,
        id_unique,
        id_uuid,
        location,
        address_full_road_en,
        address_full_jibun_en,
        show
        FROM ${TABLE_HOSPITAL}
        ORDER BY created_at DESC
        LIMIT 4
      `;
      rows = await q<HospitalData>(fallbackSql);
    }

    return Response.json(
      { data: rows },
      { status: 200, statusText: "success", headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/home/hospital/beauty error:", error);
    return Response.json(
      { data: [], error: message },
      { status: 500, statusText: message, headers: { "Cache-Control": "no-store" } }
    );
  }
}
