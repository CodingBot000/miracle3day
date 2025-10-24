import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions) as any;
    
    return NextResponse.json({ auth: session.auth || null });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ auth: null });
  }
}