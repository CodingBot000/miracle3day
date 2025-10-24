import { NextResponse } from 'next/server';

// This endpoint is no longer used - terms agreement is handled in /api/auth/consent/accept
export async function POST(req: Request) {
  return NextResponse.json({ ok: true, message: 'Terms agreement handled by consent endpoint' });
}
