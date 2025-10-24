import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { TABLE_BANNER_SHOW, TABLE_BANNER_ITEM } from "@/constants/tables";

export const runtime = "nodejs";

type BannerShowRow = { id_banneritems: string[] | null };

export async function GET() {
  try {
    const shows = await q<BannerShowRow>(`SELECT id_banneritems FROM ${TABLE_BANNER_SHOW}`);
    const idBannerItems = Array.from(
      new Set(
        shows.flatMap((row) => row.id_banneritems ?? []).filter(Boolean)
      )
    );

    if (!idBannerItems.length) {
      return NextResponse.json(
        { data: [] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const items = await q(
      `SELECT * FROM ${TABLE_BANNER_ITEM} WHERE id_unique = ANY($1::text[])`,
      [idBannerItems]
    );

    return NextResponse.json(
      { data: items },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load banners";
    console.error("GET /api/home/banner error:", error);
    return NextResponse.json(
      { data: null, error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
