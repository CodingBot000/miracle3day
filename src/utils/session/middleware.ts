import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(_: NextRequest) {
  return NextResponse.next();
}
