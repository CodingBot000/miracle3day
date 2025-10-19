import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    pgHost: process.env.PGHOST,
    hasPassword: Boolean(process.env.PGPASSWORD),
  });
}
