import { NextResponse } from "next/server";
import { LOCATIONS } from "@/constants";
import { TABLE_HOSPITAL } from "@/constants/tables";
import { q } from "@/lib/db";

type LocationRow = {
  latitude: number | null;
  longitude: number | null;
  name: string;
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAll = params.id.toUpperCase() === "ALL";
    const locationKey = isAll
      ? null
      : LOCATIONS.find((loc) => loc.toLowerCase() === params.id.toLowerCase());

    if (!isAll && !locationKey) {
      return NextResponse.json({ position: [] }, { status: 404 });
    }

    const rows = await q<LocationRow>(
      `
        SELECT latitude, longitude, name
        FROM ${TABLE_HOSPITAL}
        WHERE show = true
        ${locationKey ? "AND location = $1" : ""}
      `,
      locationKey ? [locationKey] : []
    );

    const position = rows
      .filter((row) => row.latitude !== null && row.longitude !== null)
      .map((row) => ({
        lat: row.latitude!,
        lng: row.longitude!,
        title: row.name,
      }));

    return NextResponse.json(
      { position },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch positions";
    console.error("GET /api/location/[id]/position error:", error);
    return NextResponse.json(
      { position: [], error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
