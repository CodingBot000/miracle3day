import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-helper";
import { q } from "@/lib/db";
import { TABLE_MEMBERS } from "@/constants/tables";

export async function GET() {
  const authSession = await getAuthSession(req); if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const { userId } = authSession;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let rows = await q<{ point_balance: number | null }>(
      `
        SELECT point_balance
        FROM ${TABLE_MEMBERS}
        WHERE clerk_user_id = $1
        LIMIT 1
      `,
      [userId]
    );

    if (!rows.length) {
      try {
        rows = await q<{ point_balance: number | null }>(
          `
            SELECT point_balance
            FROM ${TABLE_MEMBERS}
            WHERE id_uuid::text = $1
            LIMIT 1
          `,
          [userId]
        );
      } catch {
        // ignore column mismatch
      }
    }

    if (!rows.length) {
      try {
        rows = await q<{ point_balance: number | null }>(
          `
            SELECT point_balance
            FROM ${TABLE_MEMBERS}
            WHERE uuid::text = $1
            LIMIT 1
          `,
          [userId]
        );
      } catch {
        // ignore column mismatch
      }
    }

    const balance = rows[0]?.point_balance ?? 0;
    return NextResponse.json({ point_balance: balance });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch point balance";
    console.error("GET /api/point error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
