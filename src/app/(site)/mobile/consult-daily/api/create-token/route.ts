import { log } from '@/utils/logger';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { roomName, userName, role } = (await request.json().catch(() => ({}))) as {
    roomName?: string;
    userName?: string;
    role?: string; // "doctor" | "patient"
  };

  if (!roomName) {
    return NextResponse.json(
      { error: "local-error", info: "roomName is required" },
      { status: 400 },
    );
  }

  try {
    const dailyRes = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          // 최소 구성이 잘 되도록 user_name / is_owner / exp 를 명시
          user_name: userName || "Guest",
          is_owner: role === "doctor",
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1시간 유효
        },
      }),
    });

    const data = (await dailyRes.json().catch(() => ({}))) as {
      error?: string;
      info?: string;
      token?: string;
      [key: string]: any;
    };

    log.debug("[Daily][create-token] status:", dailyRes.status);
    log.debug("[Daily][create-token] response:", data);

    if (!dailyRes.ok) {
      // Daily 가 준 에러를 그대로 전달
      return NextResponse.json(data, { status: dailyRes.status });
    }

    // 정상: { token: "..." }
    if (!data.token) {
      return NextResponse.json(
        { error: "local-error", info: "No token field in Daily response" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("[Daily][create-token] unexpected error:", e);
    return NextResponse.json(
      { error: "local-error", info: e?.message ?? "unknown error" },
      { status: 500 },
    );
  }
}
