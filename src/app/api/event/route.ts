import { TABLE_EVENT } from "@/constants/tables";
import { infinityParams } from "@/utils/inifinityQuery";
import { createClient } from "@/utils/session/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backendClient = createClient();

  try {
    const { limit, nextCursor, offset } = infinityParams({ req, limits: 6 });

    const { data, error, status, statusText, count } = await backendClient
      .from(TABLE_EVENT)
      .select("*", { count: "exact" })
      .range(offset, limit)
      .order("date_to", { ascending: true });

    if (!data || error) {
      return NextResponse.json({ data: null }, { status, statusText });
    }

    return NextResponse.json(
      { data, nextCursor: nextCursor(count) },
      { status, statusText }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
