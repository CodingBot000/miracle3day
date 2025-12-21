export const revalidate = 300;
export const runtime = 'nodejs';

import { TABLE_HOSPITAL } from "@/constants/tables";
import { q } from "@/lib/db";
import type { HospitalData } from "@/models/hospitalData.dto";
import { shuffleAndApplyPriority } from "@/utils/hospitalPriority";

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

      `;
      rows = await q<HospitalData>(fallbackSql);
    }

    // Randomize the order of hospitals and apply priority rules
    const shuffledRows = shuffleAndApplyPriority(rows);

    return Response.json(
      { data: shuffledRows },
      {
        status: 200,
        statusText: "success",
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600"
        }
      }
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
