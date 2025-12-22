import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const res = NextResponse.json({ success: true });
    const session = await getIronSession(req, res, sessionOptions) as any;

    session.destroy();

    return res;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}