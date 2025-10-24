import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { TABLE_COUNTRY_CODES } from "@/constants/tables";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await q(`SELECT * FROM ${TABLE_COUNTRY_CODES}`);
    return NextResponse.json(
      { countryCode: rows },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load country codes";
    console.error("GET /api/auth/countryCode error:", error);
    return NextResponse.json(
      { countryCode: null, error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
