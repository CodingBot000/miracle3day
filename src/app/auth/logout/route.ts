import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions) as any;
    
    // 세션 데이터 삭제
    session.destroy();
    
    return NextResponse.json({ success: true }, { headers: res.headers });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
