
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

/**
 * 
 * API Route (서버 라우트) 안에서 iron-session을 쉽게 불러와서
로그인된 사용자의 세션 데이터를 확인하기 위한 공용 함수
 */
export async function getSessionFromRoute(req: NextRequest, res: NextResponse) {
  return getIronSession(req, res, sessionOptions);
}
