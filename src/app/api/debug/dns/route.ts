import { NextResponse } from "next/server";
import { promises as dns } from "node:dns";

export async function GET() {
  try {
    const host = process.env.PGHOST!;
    const res = await dns.lookup(host);
    return NextResponse.json({ host, address: res.address, family: res.family });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
