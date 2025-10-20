import { TABLE_HOSPITAL } from "@/constants/tables";
import { query } from "@/lib/db";
import type { HospitalData } from "@/app/models/hospitalData.dto";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const locationNum = url.searchParams.get("locationNum");

    const values: any[] = [];
    const where: string[] = ["show = true"];
    if (locationNum) {
      values.push(locationNum);
      where.push(`location = $${values.length}`);
    }

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
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY created_at DESC
    `;

    const { rows, rowCount } = await query<HospitalData>(sql, values);

    return Response.json(
      { data: rows, total: rowCount ?? rows.length },
      { status: 200, statusText: "success", headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/home/hospital/location error:", error);
    return Response.json(
      { data: [], total: 0, error: message },
      { status: 500, statusText: message, headers: { "Cache-Control": "no-store" } }
    );
  }
}
