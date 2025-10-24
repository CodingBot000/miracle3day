import { NextResponse } from "next/server";
import { TABLE_HOSPITAL, TABLE_EVENT } from "@/constants/tables";
import { q } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idUnique = params.id;

    const events = await q(
      `SELECT * FROM ${TABLE_EVENT} WHERE id_unique = $1 ORDER BY created_at ASC`,
      [idUnique]
    );

    if (!events.length) {
      return NextResponse.json({ data: null }, { status: 404 });
    }

    const hospitalUuid = events[0]?.id_uuid_hospital ?? null;
    let hospitalData: any = null;

    if (hospitalUuid) {
      const hospitals = await q(
        `SELECT * FROM ${TABLE_HOSPITAL} WHERE show = true AND id_uuid = $1 LIMIT 1`,
        [hospitalUuid]
      );
      hospitalData = hospitals[0] ?? null;
    }

    const updatedData = events.map((event) => ({
      ...event,
      id_surgeries: hospitalData?.id_surgeries ?? event.id_surgeries,
      hospitalData,
    }));

    return NextResponse.json(
      { data: updatedData },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch event";
    console.error("GET /api/event/[id] error:", error);
    return NextResponse.json(
      { data: null, error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
