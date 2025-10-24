import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const res = NextResponse.redirect(new URL("/", req.url));
    const session = await getIronSession(req, res, sessionOptions) as any;
    
    session.destroy();
    
    return res;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}