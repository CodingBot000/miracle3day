import { log } from '@/utils/logger';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // reservationId 를 받긴 하지만, roomName 은 문자열만 잘 나오면 됨
  const { reservationId } = (await request.json().catch(() => ({}))) as {
    reservationId?: string;
  };

  const roomName = `bl-${reservationId ?? "test"}`;

  try {
    const dailyRes = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      // 🔹 Daily 공식 문서 기준: name, privacy 만 넣는 가장 기본형으로 보냄
      //   properties 같은 옵션 전부 제거 (문제 생기는 요소를 없애기 위해)
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
      }),
    });

    const data = (await dailyRes.json().catch(() => ({}))) as {
      error?: string;
      info?: string;
      [key: string]: any;
    };

    log.debug("[Daily][create-room] status:", dailyRes.status);
    log.debug("[Daily][create-room] response:", data);

    // 1) 이미 존재하는 방이면 → 성공으로 간주
    if (
      !dailyRes.ok &&
      !(
        data?.error === "invalid-request-error" &&
        typeof data?.info === "string" &&
        data.info.includes("already exists")
      )
    ) {
      // 진짜 에러만 클라이언트로 전달
      return NextResponse.json(data, { status: dailyRes.status });
    }

    // 이미 존재하는 경우에도 room 객체 형태를 맞춰서 반환
    return NextResponse.json({
      ...(data || {}),
      name: roomName,
    });
  } catch (e: any) {
    console.error("[Daily][create-room] unexpected error:", e);
    return NextResponse.json(
      { error: "local-error", info: e?.message ?? "unknown error" },
      { status: 500 },
    );
  }
}
