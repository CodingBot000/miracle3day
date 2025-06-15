import { NextRequest, NextResponse } from "next/server";
import { getEventByCategoryAPI } from ".";

export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {

    const { searchParams } = new URL(req.url);

  // 쿼리 파라미터 추출
  const main = searchParams.get("main") ?? "";
  const depth1 = searchParams.get("depth1") ?? "";
  const depth2 = searchParams.get("depth2") ?? "";
  const depth3 = searchParams.get("depth3") ?? "";

  // 서비스에서 DB조회 (main, depth1, depth2, depth3 기준)
  const data = await getEventByCategoryAPI({ main, depth1, depth2, depth3 });

  return NextResponse.json({ data });
}
