import { NextResponse } from 'next/server';
import { getUserInfo } from '../user.service';

export async function GET() {
  const result = await getUserInfo();
  
  if (!result) {
    return NextResponse.json({ userInfo: null }, { status: 401 });
  }

  return NextResponse.json(result);
}
